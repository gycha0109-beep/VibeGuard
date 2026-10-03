-- FrameVote schema (apply via the backend's migration tool once connected)
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '' check (char_length(display_name) <= 60),
  bio text not null default '' check (char_length(bio) <= 500),
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  image_path text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  question text not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);
create table public.user_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (name in ('entry_list_view','entry_view','entry_edit','vote_submit','result_view','profile_update','sign_in')),
  entry_id uuid references public.entries(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.user_events (created_at);

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.entries, public.polls to anon, authenticated;
grant insert, update, delete on public.entries to authenticated;
grant select on public.votes to authenticated;
grant select on public.user_events to authenticated;
grant all on all tables in schema public to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.entries enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.user_events enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "published or own" on public.entries for select using (published or owner_id = auth.uid());
create policy "insert own" on public.entries for insert to authenticated with check (owner_id = auth.uid());
create policy "update own" on public.entries for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own" on public.entries for delete to authenticated using (owner_id = auth.uid());
create policy "polls of visible entries" on public.polls for select using (exists (select 1 from public.entries e where e.id = entry_id));
create policy "read own votes" on public.votes for select to authenticated using (user_id = auth.uid());
create policy "admins read events" on public.user_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.record_event(_name text, _entry_id uuid default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _id bigint;
begin
  if _uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if _name not in ('entry_list_view','entry_view','entry_edit','result_view','profile_update','sign_in') then
    raise exception 'event is not client-recordable' using errcode = '22023';
  end if;

  if _entry_id is not null and not exists (
    select 1
    from public.entries e
    where e.id = _entry_id
      and (e.published or e.owner_id = _uid)
  ) then
    raise exception 'entry is not visible' using errcode = '42501';
  end if;

  insert into public.user_events(user_id, name, entry_id)
  values (_uid, _name, _entry_id)
  returning id into _id;

  return _id;
end;
$$;

create or replace function public.submit_vote(_poll_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _entry_id uuid;
  _inserted integer := 0;
  _count bigint;
begin
  if _uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select p.entry_id
  into _entry_id
  from public.polls p
  join public.entries e on e.id = p.entry_id
  where p.id = _poll_id
    and p.is_open
    and (e.published or e.owner_id = _uid);

  if _entry_id is null then
    raise exception 'poll unavailable' using errcode = '22023';
  end if;

  insert into public.votes(poll_id, user_id)
  values (_poll_id, _uid)
  on conflict (poll_id, user_id) do nothing;

  get diagnostics _inserted = row_count;

  if _inserted = 1 then
    insert into public.user_events(user_id, name, entry_id)
    values (_uid, 'vote_submit', _entry_id);
  end if;

  select count(*) into _count
  from public.votes
  where poll_id = _poll_id;

  return jsonb_build_object(
    'inserted', _inserted = 1,
    'vote_count', _count
  );
end;
$$;

grant execute on function public.record_event(text, uuid) to authenticated;
grant execute on function public.submit_vote(uuid) to authenticated;

-- Vote count without exposing voters
create or replace function public.poll_result(_poll_id uuid)
returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.votes v join public.polls p on p.id = v.poll_id
  join public.entries e on e.id = p.entry_id
  where v.poll_id = _poll_id and (e.published or e.owner_id = auth.uid())
$$;
grant execute on function public.poll_result(uuid) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name) values (new.id, new.email, split_part(new.email, '@', 1));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('entry-images', 'entry-images', false)
on conflict (id) do update set public = excluded.public;

create policy "read published or own images" on storage.objects for select to anon, authenticated
using (
  bucket_id = 'entry-images'
  and (
    exists (
      select 1
      from public.entries e
      where e.image_path = name
        and e.published
    )
    or (
      auth.uid() is not null
      and (storage.foldername(name))[1] = auth.uid()::text
    )
  )
);

create policy "upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "update own files" on storage.objects for update to authenticated
  using (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);
