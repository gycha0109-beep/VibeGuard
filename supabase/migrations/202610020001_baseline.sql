-- VibeGuard intentionally vulnerable synthetic baseline.
-- This migration targets Supabase and relies on Supabase's built-in auth.uid().

create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  display_name text not null,
  role text not null default 'user',
  private_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.contents (
  id uuid primary key,
  owner_id uuid not null references public.profiles(id),
  title text not null,
  image_url text not null,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key references public.contents(id),
  is_open boolean not null default true,
  like_count integer not null default 0
);

create table if not exists public.votes (
  id bigint generated always as identity primary key,
  poll_id uuid not null references public.polls(id),
  user_id uuid not null references public.profiles(id),
  option text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  user_id uuid,
  session_id text,
  content_id uuid,
  occurred_at timestamptz not null default now(),
  properties jsonb not null default '{}'::jsonb,
  source text not null default 'web',
  version integer not null default 1
);

create table if not exists public.admin_notes (
  id bigint generated always as identity primary key,
  subject_user_id uuid not null references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.contents enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.user_events enable row level security;
alter table public.admin_notes enable row level security;

create policy "baseline_profiles_read_all" on public.profiles for select using (true);
create policy "baseline_profiles_update_all" on public.profiles for update using (true) with check (true);
create policy "baseline_contents_read_all" on public.contents for select using (true);
create policy "baseline_votes_insert_any" on public.votes for insert with check (true);
create policy "baseline_events_read_all" on public.user_events for select using (true);
create policy "baseline_events_insert_any" on public.user_events for insert with check (true);
create policy "baseline_admin_notes_read" on public.admin_notes for select using (true);

create or replace function public.baseline_submit_vote(p_poll uuid, p_user uuid, p_option text)
returns void language plpgsql security invoker as $$
begin
  insert into public.votes(poll_id,user_id,option) values(p_poll,p_user,p_option);
  update public.polls set like_count = like_count + 1 where id = p_poll;
end;
$$;
grant execute on function public.baseline_submit_vote(uuid,uuid,text) to public;

create or replace function public.baseline_export_events()
returns setof public.user_events language sql security definer set search_path = public as $$
  select * from public.user_events order by occurred_at desc
$$;
grant execute on function public.baseline_export_events() to public;
