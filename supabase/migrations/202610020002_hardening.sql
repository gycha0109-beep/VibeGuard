-- VibeGuard remediation migration. Intended for Supabase/PostgreSQL.

create schema if not exists private;

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;
revoke all on function private.current_user_is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_is_admin() to authenticated;

drop policy if exists "baseline_profiles_read_all" on public.profiles;
drop policy if exists "baseline_profiles_update_all" on public.profiles;
drop policy if exists "baseline_contents_read_all" on public.contents;
drop policy if exists "baseline_votes_insert_any" on public.votes;
drop policy if exists "baseline_events_read_all" on public.user_events;
drop policy if exists "baseline_events_insert_any" on public.user_events;
drop policy if exists "baseline_admin_notes_read" on public.admin_notes;

create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
using (auth.uid() = id or private.current_user_is_admin());
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated
using (auth.uid() = id or private.current_user_is_admin())
with check (auth.uid() = id or private.current_user_is_admin());

-- SEC-009: RLS controls rows, not privileged columns. Prevent a normal user
-- from self-promoting role/email while still allowing profile self-service.
create or replace function private.protect_profile_privileged_fields()
returns trigger
language plpgsql
security invoker
set search_path = public, private, pg_catalog
as $profile_guard$
begin
  if current_user in ('postgres', 'service_role') or private.current_user_is_admin() then
    return new;
  end if;

  if auth.uid() = old.id
     and new.role is not distinct from old.role
     and new.email is not distinct from old.email then
    return new;
  end if;

  raise exception 'privileged profile fields are immutable'
    using errcode = '42501';
end;
$profile_guard$;
revoke all on function private.protect_profile_privileged_fields() from public;
grant execute on function private.protect_profile_privileged_fields() to authenticated;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before update on public.profiles
for each row execute function private.protect_profile_privileged_fields();

-- Public content visibility is separated from authenticated owner/admin access so
-- anonymous reads never need EXECUTE permission on the private admin helper.
create policy "contents_select_published" on public.contents for select
using (status = 'published');
create policy "contents_select_owner_or_admin" on public.contents for select to authenticated
using (owner_id = auth.uid() or private.current_user_is_admin());
create policy "contents_insert_owner" on public.contents for insert to authenticated
with check (owner_id = auth.uid() or private.current_user_is_admin());
create policy "contents_update_owner_or_admin" on public.contents for update to authenticated
using (owner_id = auth.uid() or private.current_user_is_admin())
with check (owner_id = auth.uid() or private.current_user_is_admin());
create policy "contents_delete_owner_or_admin" on public.contents for delete to authenticated
using (owner_id = auth.uid() or private.current_user_is_admin());

create policy "polls_select" on public.polls for select using (true);
create policy "polls_admin_write" on public.polls for all to authenticated
using (private.current_user_is_admin()) with check (private.current_user_is_admin());

create policy "votes_select_self_or_admin" on public.votes for select to authenticated
using (user_id = auth.uid() or private.current_user_is_admin());
create policy "votes_insert_self" on public.votes for insert to authenticated
with check (user_id = auth.uid());

create policy "events_insert_actor" on public.user_events for insert
with check (user_id is null or user_id = auth.uid());
create policy "events_admin_read" on public.user_events for select to authenticated
using (private.current_user_is_admin());

create policy "admin_notes_admin_only" on public.admin_notes for all to authenticated
using (private.current_user_is_admin()) with check (private.current_user_is_admin());

alter table public.votes
  add constraint votes_poll_user_unique unique (poll_id, user_id);

alter table public.user_events add column if not exists dedupe_key text;
create unique index if not exists user_events_dedupe_key_unique
  on public.user_events(dedupe_key) where dedupe_key is not null;

revoke all on function public.baseline_submit_vote(uuid,uuid,text) from public;
revoke all on function public.baseline_export_events() from public;

drop function if exists public.submit_vote(uuid,text,text);
drop function if exists public.submit_vote(uuid,text,text,text);
create function public.submit_vote(p_poll uuid, p_option text, p_dedupe_key text, p_session_id text)
returns jsonb
language plpgsql
-- The RPC is the transaction boundary for vote + aggregate + canonical event.
-- It executes with owner privileges so internal aggregate/event writes do not
-- depend on end-user RLS. The caller identity is still taken only from auth.uid().
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user uuid := auth.uid();
  v_inserted bigint;
  v_count integer;
begin
  if v_user is null then raise exception 'unauthenticated' using errcode = '28000'; end if;
  if nullif(trim(p_session_id), '') is null then raise exception 'session required' using errcode = '22023'; end if;
  if p_option not in ('like') then raise exception 'invalid option' using errcode = '22023'; end if;
  if not exists (select 1 from public.polls where id = p_poll and is_open) then
    raise exception 'poll closed or missing' using errcode = '22023';
  end if;

  insert into public.votes(poll_id, user_id, option)
  values (p_poll, v_user, p_option)
  on conflict (poll_id, user_id) do nothing
  returning id into v_inserted;

  if v_inserted is not null then
    update public.polls set like_count = like_count + 1 where id = p_poll;
    insert into public.user_events(event_name,user_id,content_id,session_id,properties,source,version,dedupe_key)
    values ('vote_submitted',v_user,p_poll,p_session_id,'{}'::jsonb,'server',1,p_dedupe_key)
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;

  select like_count into v_count from public.polls where id = p_poll;
  return jsonb_build_object('accepted', true, 'duplicate', v_inserted is null, 'count', v_count);
end;
$$;
revoke all on function public.submit_vote(uuid,text,text,text) from public;
grant execute on function public.submit_vote(uuid,text,text,text) to authenticated;

create or replace function public.admin_export_events()
returns table(event_name text,user_id uuid,session_id text,content_id uuid,occurred_at timestamptz,source text,version integer,properties jsonb)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if not private.current_user_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select e.event_name,e.user_id,e.session_id,e.content_id,e.occurred_at,e.source,e.version,e.properties
  from public.user_events e order by e.occurred_at desc;
end;
$$;
revoke all on function public.admin_export_events() from public;
grant execute on function public.admin_export_events() to authenticated;

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "content_images_public_read" on storage.objects';
    execute 'drop policy if exists "content_images_owner_insert" on storage.objects';
    execute 'drop policy if exists "content_images_owner_update" on storage.objects';
    execute 'drop policy if exists "content_images_owner_delete" on storage.objects';
    execute 'create policy "content_images_public_read" on storage.objects for select using (bucket_id = ''content-images'')';
    execute 'create policy "content_images_owner_insert" on storage.objects for insert to authenticated with check (bucket_id = ''content-images'' and (storage.foldername(name))[1] = auth.uid()::text)';
    execute 'create policy "content_images_owner_update" on storage.objects for update to authenticated using (bucket_id = ''content-images'' and ((storage.foldername(name))[1] = auth.uid()::text or private.current_user_is_admin())) with check (bucket_id = ''content-images'' and ((storage.foldername(name))[1] = auth.uid()::text or private.current_user_is_admin()))';
    execute 'create policy "content_images_owner_delete" on storage.objects for delete to authenticated using (bucket_id = ''content-images'' and ((storage.foldername(name))[1] = auth.uid()::text or private.current_user_is_admin()))';
  end if;
end $$;

create or replace function public.admin_funnel(p_from timestamptz default now() - interval '7 days', p_to timestamptz default now())
returns table(stage_order integer, event_name text, sessions bigint, conversion_from_previous numeric, dropoff_from_previous numeric)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if not private.current_user_is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
  with stages(stage_order,event_name) as (
    values
      (1,'content_viewed'::text),
      (2,'edit_started'::text),
      (3,'edit_completed'::text),
      (4,'vote_started'::text),
      (5,'vote_submitted'::text),
      (6,'result_viewed'::text)
  ), counts as (
    select s.stage_order, s.event_name, count(distinct e.session_id)::bigint as sessions
    from stages s
    left join public.user_events e on e.event_name = s.event_name
      and e.occurred_at >= p_from and e.occurred_at < p_to and e.session_id is not null
    group by s.stage_order, s.event_name
  ), with_prev as (
    select c.*, lag(c.sessions) over(order by c.stage_order) as previous_sessions
    from counts c
  )
  select w.stage_order, w.event_name, w.sessions,
    case when w.previous_sessions is null then null
         when w.previous_sessions = 0 then 0
         else round((w.sessions::numeric / w.previous_sessions::numeric) * 100, 2) end as conversion_from_previous,
    case when w.previous_sessions is null then null
         when w.previous_sessions = 0 then 0
         else round((1 - w.sessions::numeric / w.previous_sessions::numeric) * 100, 2) end as dropoff_from_previous
  from with_prev w order by w.stage_order;
end;
$$;
revoke all on function public.admin_funnel(timestamptz,timestamptz) from public;
grant execute on function public.admin_funnel(timestamptz,timestamptz) to authenticated;
