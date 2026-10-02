-- Run against disposable Supabase local/staging only. This script mutates test rows and rolls back.
begin;

insert into public.profiles(id,email,display_name,role,private_note) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','a@example.test','A','user','A-private'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','b@example.test','B','user','B-private'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','admin@example.test','Admin','admin','admin-private')
on conflict (id) do update set role = excluded.role, private_note = excluded.private_note;

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);
do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  if n <> 0 then raise exception 'SEC-001 failed: A can read B'; end if;
end $$;

do $$
declare n integer;
begin
  update public.profiles set display_name='tampered' where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'SEC-002 failed: A can update B'; end if;
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  if n <> 1 then raise exception 'self read unexpectedly blocked'; end if;
  update public.profiles set display_name='A2' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'self update unexpectedly blocked'; end if;
end $$;

select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',true);
do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  if n <> 1 then raise exception 'admin boundary failed'; end if;
end $$;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);
do $$
declare n integer;
begin
  select count(*) into n from public.admin_notes;
  if n <> 0 then raise exception 'SEC-006 failed: ordinary user can read admin notes'; end if;
end $$;
do $$
declare n integer;
begin
  select count(*) into n from public.user_events;
  if n <> 0 then raise exception 'SEC-004 failed: ordinary user can read raw events'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$
declare n integer;
begin
  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'anon profile boundary failed'; end if;
end $$;

reset role;
rollback;
