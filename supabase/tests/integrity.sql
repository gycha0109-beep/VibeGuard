-- Run against disposable Supabase local/staging only. Demonstrates DB-level duplicate prevention.
begin;
insert into public.profiles(id,email,display_name,role) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','a@example.test','A','user')
on conflict (id) do nothing;
insert into public.contents(id,owner_id,title,image_url,status) values
('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Test','https://example.test/a.jpg','published')
on conflict (id) do nothing;
insert into public.polls(id,is_open,like_count) values
('11111111-1111-1111-1111-111111111111',true,0)
on conflict (id) do update set is_open=true, like_count=0;

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);
select public.submit_vote('11111111-1111-1111-1111-111111111111','like','retry-1','session-1');
select public.submit_vote('11111111-1111-1111-1111-111111111111','like','retry-2','session-1');

do $$
declare vote_rows integer; aggregate_count integer;
begin
  select count(*) into vote_rows from public.votes where poll_id='11111111-1111-1111-1111-111111111111' and user_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  select like_count into aggregate_count from public.polls where id='11111111-1111-1111-1111-111111111111';
  if vote_rows <> 1 then raise exception 'INT-001 failed: expected one vote, got %', vote_rows; end if;
  if aggregate_count <> 1 then raise exception 'INT-003 failed: expected aggregate 1, got %', aggregate_count; end if;
end $$;
reset role;
rollback;
