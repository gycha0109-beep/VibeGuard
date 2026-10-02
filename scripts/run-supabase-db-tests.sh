#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER="${SUPABASE_DB_CONTAINER:-$(docker ps --filter 'name=supabase_db_' --format '{{.Names}}' | head -n 1)}"
if [[ -z "${DB_CONTAINER}" ]]; then
  echo "Supabase DB container not found" >&2
  exit 1
fi

run_psql() {
  docker exec -i "${DB_CONTAINER}" psql -U postgres -d postgres -X -v ON_ERROR_STOP=1 "$@"
}

echo "[db] RLS/AuthZ/Storage negative suite"
run_psql < supabase/tests/rls_negative.sql

echo "[db] sequential integrity suite"
run_psql < supabase/tests/integrity.sql

echo "[db] prepare real concurrency fixture"
run_psql <<'SQL'
insert into public.profiles(id,email,display_name,role)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd','race@example.test','Race User','user')
on conflict (id) do update set role='user';

insert into public.contents(id,owner_id,title,image_url,status)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','dddddddd-dddd-dddd-dddd-dddddddddddd','Race Content','https://example.test/race.svg','published')
on conflict (id) do nothing;

insert into public.polls(id,is_open,like_count)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',true,0)
on conflict (id) do update set is_open=true, like_count=0;

delete from public.user_events
where user_id='dddddddd-dddd-dddd-dddd-dddddddddddd';
delete from public.votes
where poll_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
SQL

echo "[db] 20 concurrent duplicate vote requests"
pids=()
for i in $(seq 1 20); do
  docker exec "${DB_CONTAINER}" psql -U postgres -d postgres -X -q -v ON_ERROR_STOP=1     -c "set role authenticated; select set_config('request.jwt.claim.sub','dddddddd-dddd-dddd-dddd-dddddddddddd',false); select public.submit_vote('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','like','race-${i}','race-session');"     >"/tmp/vibeguard-race-${i}.log" 2>&1 &
  pids+=("$!")
done

failed=0
for i in "${!pids[@]}"; do
  if ! wait "${pids[$i]}"; then
    cat "/tmp/vibeguard-race-$((i+1)).log" >&2 || true
    failed=1
  fi
done
if [[ "${failed}" -ne 0 ]]; then
  echo "One or more concurrent vote sessions failed" >&2
  exit 1
fi

echo "[db] verify one durable vote, one aggregate increment, one canonical event"
run_psql <<'SQL'
do $$
declare
  vote_rows integer;
  aggregate_count integer;
  canonical_events integer;
begin
  select count(*) into vote_rows
  from public.votes
  where poll_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    and user_id='dddddddd-dddd-dddd-dddd-dddddddddddd';

  select like_count into aggregate_count
  from public.polls
  where id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  select count(*) into canonical_events
  from public.user_events
  where event_name='vote_submitted'
    and user_id='dddddddd-dddd-dddd-dddd-dddddddddddd'
    and content_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  if vote_rows <> 1 then
    raise exception 'INT-001/002 failed: expected one durable vote, got %', vote_rows;
  end if;
  if aggregate_count <> 1 then
    raise exception 'INT-003 failed: expected aggregate 1, got %', aggregate_count;
  end if;
  if canonical_events <> 1 then
    raise exception 'EVT-004 failed: expected one canonical vote_submitted event, got %', canonical_events;
  end if;
end $$;

delete from public.user_events
where user_id='dddddddd-dddd-dddd-dddd-dddddddddddd';
delete from public.votes
where poll_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
delete from public.polls
where id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
delete from public.contents
where id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
delete from public.profiles
where id='dddddddd-dddd-dddd-dddd-dddddddddddd';
SQL

echo "[db] PASS live local RLS/AuthZ/Storage + concurrency integrity"
