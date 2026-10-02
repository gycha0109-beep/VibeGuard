-- Live local analytics/funnel/deduplication suite. All fixtures roll back.
\set ON_ERROR_STOP on
begin;

insert into public.profiles(id,email,display_name,role)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc','admin@example.test','Admin','admin')
on conflict (id) do update set role='admin';

delete from public.user_events
where session_id in ('funnel-a','funnel-b','dedupe-session');

insert into public.user_events(event_name,user_id,session_id,occurred_at,properties,source,version,dedupe_key) values
('content_viewed',null,'funnel-a','2026-10-02T00:00:01Z','{}','web',1,'fa-1'),
('edit_started',null,'funnel-a','2026-10-02T00:00:02Z','{}','web',1,'fa-2'),
('edit_completed',null,'funnel-a','2026-10-02T00:00:03Z','{}','web',1,'fa-3'),
('vote_started',null,'funnel-a','2026-10-02T00:00:04Z','{}','web',1,'fa-4'),
('vote_submitted',null,'funnel-a','2026-10-02T00:00:05Z','{}','server',1,'fa-5'),
('result_viewed',null,'funnel-a','2026-10-02T00:00:06Z','{}','web',1,'fa-6'),
('content_viewed',null,'funnel-b','2026-10-02T00:01:01Z','{}','web',1,'fb-1'),
('edit_started',null,'funnel-b','2026-10-02T00:01:02Z','{}','web',1,'fb-2');

insert into public.user_events(event_name,user_id,session_id,occurred_at,properties,source,version,dedupe_key)
values ('share_clicked',null,'dedupe-session','2026-10-02T00:02:00Z','{}','web',1,'dedupe-once');

insert into public.user_events(event_name,user_id,session_id,occurred_at,properties,source,version,dedupe_key)
values ('share_clicked',null,'dedupe-session','2026-10-02T00:02:01Z','{}','web',1,'dedupe-once')
on conflict (dedupe_key) where dedupe_key is not null do nothing;

do $analytics_dedupe$
declare n integer;
begin
  select count(*) into n from public.user_events where dedupe_key='dedupe-once';
  if n <> 1 then raise exception 'EVT-004 failed: dedupe key produced % rows', n; end if;
end;
$analytics_dedupe$;

set local role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-cccc-cccc-cccccccccccc',true);

do $analytics_funnel$
declare
  s1 bigint; s2 bigint; s3 bigint; s4 bigint; s5 bigint; s6 bigint;
  c3 numeric; d3 numeric;
begin
  select sessions into s1 from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=1;
  select sessions into s2 from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=2;
  select sessions, conversion_from_previous, dropoff_from_previous
    into s3, c3, d3
    from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=3;
  select sessions into s4 from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=4;
  select sessions into s5 from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=5;
  select sessions into s6 from public.admin_funnel('2026-10-01','2026-10-03') where stage_order=6;

  if array[s1,s2,s3,s4,s5,s6] <> array[2::bigint,2::bigint,1::bigint,1::bigint,1::bigint,1::bigint] then
    raise exception 'EVT-002 failed: unexpected sequential funnel counts %', array[s1,s2,s3,s4,s5,s6];
  end if;
  if c3 <> 50.00 or d3 <> 50.00 then
    raise exception 'EVT-002 failed: expected stage3 conversion/dropoff 50/50, got %/%', c3, d3;
  end if;
end;
$analytics_funnel$;

do $analytics_export$
declare n integer;
begin
  select count(*) into n from public.admin_export_events();
  if n < 9 then raise exception 'EVT-003 failed: authorized export returned only % rows', n; end if;
end;
$analytics_export$;

reset role;
rollback;
