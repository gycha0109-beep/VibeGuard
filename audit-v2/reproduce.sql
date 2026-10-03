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

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);

insert into public.user_events(user_id, name, entry_id)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'vote_submit',
  '11111111-1111-4111-8111-111111111111'
);

reset role;

do $$
declare
  votes integer;
  events integer;
begin
  select count(*) into votes
  from public.votes
  where poll_id = '33333333-3333-4333-8333-333333333333';

  select count(*) into events
  from public.user_events
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    and name = 'vote_submit'
    and entry_id = '11111111-1111-4111-8111-111111111111';

  if votes <> 0 or events <> 1 then
    raise exception 'EVT-01 reproduction failed: expected votes=0/events=1, got votes=% events=%', votes, events;
  end if;
end $$;

delete from public.user_events
where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  and name = 'vote_submit'
  and entry_id = '11111111-1111-4111-8111-111111111111';

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);

insert into public.votes(poll_id, user_id)
values (
  '33333333-3333-4333-8333-333333333333',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
);

reset role;

do $$
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

  if votes <> 1 or events <> 0 then
    raise exception 'INT-01 reproduction failed: expected votes=1/events=0, got votes=% events=%', votes, events;
  end if;
end $$;

do $$
declare
  is_public boolean;
  is_unpublished boolean;
begin
  select public into is_public from storage.buckets where id='entry-images';
  select not published into is_unpublished from public.entries where id='22222222-2222-4222-8222-222222222222';

  if is_public is not true or is_unpublished is not true then
    raise exception 'STO-01 reproduction failed: expected public bucket + unpublished entry';
  end if;
end $$;

select 'EVT-01 CONFIRMED: vote_submit can be inserted without any vote' as result;
select 'INT-01 CONFIRMED: durable vote can exist with no vote_submit event' as result;
select 'STO-01 CONFIRMED: unpublished entry image path targets a public storage bucket' as result;

rollback;
