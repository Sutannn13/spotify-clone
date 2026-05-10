-- ============================================================
-- SUPABASE AUTH ADMIN SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable auth if not already enabled (Supabase project settings handle this)

-- 1. Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  role text not null default 'listener' check (role in ('admin', 'listener')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'listener')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 2. Row Level Security for profiles
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Row Level Security for songs
-- Public read for everyone (including guests)
create policy "Anyone can read songs"
  on public.songs for select
  using (true);

-- Only admin role can insert/update/delete songs
-- This requires the user's profile role to be 'admin'
-- For simplicity in demo mode, we use auth.uid() IS NOT NULL
-- Replace with proper admin check when ready:

-- Insert: requires admin
create policy "Admins can insert songs"
  on public.songs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or
    -- Fallback: allow any authenticated user in demo mode
    auth.uid() is not null
  );

-- Update: requires admin
create policy "Admins can update songs"
  on public.songs for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or
    auth.uid() is not null
  );

-- Delete: requires admin
create policy "Admins can delete songs"
  on public.songs for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or
    auth.uid() is not null
  );

-- 4. liked_songs table (for cloud liked songs)
create table if not exists public.liked_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id text not null,
  song_source text not null default 'supabase',
  created_at timestamptz default now(),
  unique(user_id, song_id)
);

alter table public.liked_songs enable row level security;

create policy "Users can read own liked songs"
  on public.liked_songs for select
  using (auth.uid() = user_id);

create policy "Users can manage own liked songs"
  on public.liked_songs for all
  using (auth.uid() = user_id);

-- 5. recently_played table (for cloud recently played)
create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id text not null,
  song_source text not null default 'supabase',
  played_at timestamptz default now()
);

alter table public.recently_played enable row level security;

create policy "Users can read own recently played"
  on public.recently_played for select
  using (auth.uid() = user_id);

create policy "Users can manage own recently played"
  on public.recently_played for all
  using (auth.uid() = user_id);

-- 6. Promote a user to admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- Or via Supabase Table Editor: find the row and change role to 'admin'

-- ============================================================
-- SECURITY NOTES
-- ============================================================
-- 1. The songs insert/update/delete policies above use a fallback
--    allowing any authenticated user. This is for DEMO purposes.
-- 2. For PRODUCTION security, remove the "or auth.uid() is not null"
--    fallback from all song policies so ONLY admins can modify songs.
-- 3. NEVER expose the service role key in the frontend.
-- 4. Use anon key for read operations, service role for admin scripts.
-- ============================================================