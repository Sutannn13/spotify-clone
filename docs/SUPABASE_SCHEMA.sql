-- Supabase schema for Aura music app
-- Execute in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text,
  genre text,
  mood text,
  duration numeric default 0,
  audio_url text not null,
  cover_url text,
  lyrics text default '',
  lyrics_type text not null default 'none',
  source text not null default 'supabase',
  audio_file_name text,
  cover_file_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint songs_lyrics_type_check check (lyrics_type in ('none', 'plain', 'lrc')),
  constraint songs_source_check check (source = 'supabase')
);

create index if not exists songs_created_at_idx on public.songs(created_at desc);
create index if not exists songs_artist_idx on public.songs(artist);
create index if not exists songs_title_idx on public.songs(title);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_songs_updated_at on public.songs;
create trigger set_songs_updated_at
before update on public.songs
for each row
execute function public.set_updated_at_timestamp();

-- Optional future table: liked songs
create table if not exists public.liked_songs (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references public.songs(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists liked_songs_song_id_idx on public.liked_songs(song_id);

-- Optional future table: recently played
create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references public.songs(id) on delete cascade,
  played_at timestamptz default now()
);

create index if not exists recently_played_song_id_idx on public.recently_played(song_id);
create index if not exists recently_played_played_at_idx on public.recently_played(played_at desc);
