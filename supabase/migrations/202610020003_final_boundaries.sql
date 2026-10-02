-- Final write-boundary hardening discovered during live verification.
drop policy if exists "votes_insert_self" on public.votes;
revoke insert, update, delete on table public.votes from anon, authenticated;

drop policy if exists "events_insert_actor" on public.user_events;
revoke insert, update, delete on table public.user_events from anon, authenticated;

create or replace function public.record_event(
  p_event_name text,
  p_session_id text,
  p_content_id uuid,
  p_properties jsonb,
  p_dedupe_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $record_event$
declare
  v_actor uuid := auth.uid();
  v_properties jsonb := coalesce(p_properties, '{}'::jsonb);
  v_inserted bigint;
begin
  if p_event_name not in ('session_started','content_viewed','edit_started','edit_completed','vote_started','result_viewed','share_clicked') then
    raise exception 'invalid client event' using errcode = '22023';
  end if;
  if nullif(trim(p_session_id), '') is null or char_length(p_session_id) > 128 then
    raise exception 'invalid session' using errcode = '22023';
  end if;
  if nullif(trim(p_dedupe_key), '') is null or char_length(p_dedupe_key) > 200 then
    raise exception 'invalid dedupe key' using errcode = '22023';
  end if;
  if jsonb_typeof(v_properties) <> 'object' or octet_length(v_properties::text) > 4096 then
    raise exception 'invalid properties' using errcode = '22023';
  end if;
  if p_event_name <> 'session_started' and p_content_id is null then
    raise exception 'content required' using errcode = '22023';
  end if;
  if p_content_id is not null and not exists (
    select 1 from public.contents c
    where c.id = p_content_id and (c.status = 'published' or c.owner_id = v_actor)
  ) then
    raise exception 'content unavailable' using errcode = '22023';
  end if;

  insert into public.user_events(event_name,user_id,session_id,content_id,occurred_at,properties,source,version,dedupe_key)
  values (p_event_name,v_actor,p_session_id,p_content_id,now(),v_properties,'web',1,p_dedupe_key)
  on conflict (dedupe_key) where dedupe_key is not null do nothing
  returning id into v_inserted;

  return jsonb_build_object('accepted',true,'duplicate',v_inserted is null);
end;
$record_event$;

revoke all on function public.record_event(text,text,uuid,jsonb,text) from public;
grant execute on function public.record_event(text,text,uuid,jsonb,text) to anon, authenticated;

create or replace function public.admin_export_events()
returns table(event_name text,user_id uuid,session_id text,content_id uuid,occurred_at timestamptz,source text,version integer,properties jsonb)
language plpgsql
security definer
set search_path = public, pg_catalog
as $admin_export$
begin
  if not private.current_user_is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  select e.event_name,e.user_id,e.session_id,e.content_id,e.occurred_at,e.source,e.version,e.properties
  from public.user_events e
  order by e.occurred_at desc, e.id desc;
end;
$admin_export$;

revoke all on function public.admin_export_events() from public;
grant execute on function public.admin_export_events() to authenticated;
