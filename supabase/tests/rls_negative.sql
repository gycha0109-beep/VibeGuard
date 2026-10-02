-- Live local/staging RLS/AuthZ/Storage negative suite. All fixtures roll back.
\set ON_ERROR_STOP on
begin;

insert into public.profiles(id,email,display_name,role,private_note) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','a@example.test','A','user','A-private'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','b@example.test','B','user','B-private'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','admin@example.test','Admin','admin','admin-private')
on conflict (id) do update
set email=excluded.email, display_name=excluded.display_name, role=excluded.role, private_note=excluded.private_note;

insert into public.admin_notes(subject_user_id,note)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','admin-only evidence');

insert into public.user_events(event_name,user_id,session_id,properties,source,version,dedupe_key)
values ('content_viewed','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','seed-session','{}'::jsonb,'server',1,'seed-hidden-event');

do $$
begin
  if to_regclass('storage.objects') is null or to_regclass('storage.buckets') is null then
    raise exception 'SEC-008 cannot be verified: Supabase storage schema is unavailable';
  end if;
end $$;

insert into storage.buckets(id,name,public)
values ('content-images','content-images',true)
on conflict (id) do update set public=true;

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);

do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  if n <> 0 then raise exception 'SEC-001 failed: user A can read user B private profile'; end if;
end $$;

do $$
declare n integer;
begin
  update public.profiles set display_name='tampered'
  where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'SEC-002 failed: user A can update user B'; end if;
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  if n <> 1 then raise exception 'self read unexpectedly blocked'; end if;
  update public.profiles set display_name='A2'
  where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'self ordinary-field update unexpectedly blocked'; end if;
end $$;

do $$
declare denied boolean := false;
begin
  begin
    update public.profiles set role='admin'
    where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  exception when insufficient_privilege then
    denied := true;
  end;
  if not denied then raise exception 'SEC-009 failed: user A self-promoted to admin'; end if;
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.admin_notes;
  if n <> 0 then raise exception 'SEC-006 failed: ordinary user can read admin notes'; end if;
  select count(*) into n from public.user_events;
  if n <> 0 then raise exception 'SEC-004 failed: ordinary user can read raw events'; end if;
end $$;

do $$
declare denied boolean := false;
begin
  begin
    perform * from public.admin_export_events();
  exception when insufficient_privilege then
    denied := true;
  end;
  if not denied then raise exception 'SEC-007 failed: ordinary user can call privileged export'; end if;
end $$;

insert into storage.objects(bucket_id,name)
values ('content-images','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/own.svg');

do $$
declare denied boolean := false;
begin
  begin
    insert into storage.objects(bucket_id,name)
    values ('content-images','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/cross-user.svg');
  exception when insufficient_privilege then
    denied := true;
  end;
  if not denied then raise exception 'SEC-008 failed: user A can write into user B storage path'; end if;
end $$;

select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',true);

do $$
declare n integer;
begin
  select count(*) into n from public.profiles where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  if n <> 1 then raise exception 'admin profile boundary failed'; end if;
  select count(*) into n from public.admin_export_events();
  if n < 1 then raise exception 'admin privileged export unexpectedly empty/blocked'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub','',true);

do $$
declare n integer;
begin
  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'anon private-profile boundary failed'; end if;
end $$;

reset role;
rollback;
