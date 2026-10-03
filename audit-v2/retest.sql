\set ON_ERROR_STOP on
begin;

insert into auth.users(
  id,
  instance_id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'audit-v2@example.test',
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.entries(id, owner_id, title, description, image_path, published)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Audit vote target', '', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/vote.txt', true),
  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Unpublished image target', '', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/private.txt', false);

insert into public.polls(id, entry_id, question, is_open)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Audit poll',
  true
);

insert into storage.objects(bucket_id, name)
values
  ('entry-images','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/vote.txt'),
  ('entry-images','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/private.txt');

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);

do $$
declare denied boolean := false;
begin
  begin
    insert into public.user_events(user_id, name, entry_id)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'vote_submit',
      '11111111-1111-4111-8111-111111111111'
    );
  exception when insufficient_privilege then
    denied := true;
  end;

  if not denied then
    raise exception 'EVT-01 retest failed: direct vote_submit insert still available';
  end if;
end $$;

do $$
declare denied boolean := false;
begin
  begin
    perform public.record_event(
      'vote_submit',
      '11111111-1111-4111-8111-111111111111'
    );
  exception when invalid_parameter_value then
    denied := true;
  end;

  if not denied then
    raise exception 'EVT-01 retest failed: record_event accepts canonical vote_submit';
  end if;
end $$;

do $$
declare denied boolean := false;
begin
  begin
    insert into public.votes(poll_id, user_id)
    values (
      '33333333-3333-4333-8333-333333333333',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    );
  exception when insufficient_privilege then
    denied := true;
  end;

  if not denied then
    raise exception 'INT-01 retest failed: direct vote insert still available';
  end if;
end $$;

do $
declare
  first_result jsonb;
  second_result jsonb;
begin
  first_result := public.submit_vote('33333333-3333-4333-8333-333333333333');
  second_result := public.submit_vote('33333333-3333-4333-8333-333333333333');

  if coalesce((first_result->>'inserted')::boolean,false) is not true then
    raise exception 'INT-01 retest failed: first submit_vote did not insert';
  end if;
  if coalesce((second_result->>'inserted')::boolean,true) is not false then
    raise exception 'INT-01 retest failed: duplicate submit_vote was not idempotent';
  end if;
end $;

reset role;

do $
declare
  votes integer;
  events integer;
begin
  select count(*) into votes
  from public.votes
  where poll_id = '33333333-3333-4333-8333-333333333333'
    and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  select count(*) into events
  from public.user_events
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    and name = 'vote_submit'
    and entry_id = '11111111-1111-4111-8111-111111111111';

  if votes <> 1 or events <> 1 then
    raise exception 'INT-01 retest failed: expected vote=1/event=1, got vote=% event=%', votes, events;
  end if;
end $;

do $$
declare is_public boolean;
begin
  select public into is_public from storage.buckets where id='entry-images';
  if is_public is not false then
    raise exception 'STO-01 retest failed: entry-images bucket is still public';
  end if;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub','',true);

do $$
declare
  published_visible integer;
  unpublished_visible integer;
begin
  select count(*) into published_visible
  from storage.objects
  where bucket_id='entry-images'
    and name='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/vote.txt';

  select count(*) into unpublished_visible
  from storage.objects
  where bucket_id='entry-images'
    and name='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/private.txt';

  if published_visible <> 1 or unpublished_visible <> 0 then
    raise exception 'STO-01 retest failed for anon: published=% unpublished=%', published_visible, unpublished_visible;
  end if;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);

do $$
declare unpublished_visible integer;
begin
  select count(*) into unpublished_visible
  from storage.objects
  where bucket_id='entry-images'
    and name='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/private.txt';

  if unpublished_visible <> 1 then
    raise exception 'STO-01 retest failed: owner cannot read own unpublished object';
  end if;
end $$;

select 'EVT-01 CLOSED: canonical vote event cannot be forged by the client' as result;
select 'INT-01 CLOSED: submit_vote keeps one durable vote and one canonical event' as result;
select 'STO-01 CLOSED: unpublished object is hidden from anon while owner retains access' as result;

rollback;
