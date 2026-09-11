-- ═══════════════════════════════════════════════════════════════════════════
--  SkillSwap — Complete Supabase SQL (No Supabase Auth)
--  Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Drop existing tables ─────────────────────────────────────────────────────
drop table if exists public.notifications       cascade;
drop table if exists public.swap_requests       cascade;
drop table if exists public.messages            cascade;
drop table if exists public.thread_participants cascade;
drop table if exists public.threads             cascade;
drop table if exists public.user_skills         cascade;
drop table if exists public.skills              cascade;
drop table if exists public.users               cascade;

-- ════════════════════════════════════════════════════════════════════════════
--  TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- ── users (replaces Supabase auth) ───────────────────────────────────────────
create table public.users (
  id                  uuid primary key default uuid_generate_v4(),
  email               text unique not null,
  password_hash       text not null,
  display_name        text not null,
  username            text unique not null,
  avatar_url          text,
  bio                 text,
  location            text,
  status              text not null default 'online'
                        check (status in ('online','offline','away','available')),
  gradient_index      int  not null default 0,
  sessions_completed  int  not null default 0,
  rating              numeric(3,2) not null default 0,
  review_count        int  not null default 0,
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ── skills ────────────────────────────────────────────────────────────────────
create table public.skills (
  id         uuid primary key default uuid_generate_v4(),
  name       text unique not null,
  category   text not null default 'other',
  icon       text,
  popularity int  not null default 50
);

-- ── user_skills ───────────────────────────────────────────────────────────────
create table public.user_skills (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  skill_id   uuid not null references public.skills(id) on delete cascade,
  kind       text not null check (kind in ('teach','learn')),
  level      text check (level in ('beginner','intermediate','advanced','expert')),
  created_at timestamptz not null default now(),
  unique (user_id, skill_id, kind)
);

-- ── threads ───────────────────────────────────────────────────────────────────
create table public.threads (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

-- ── thread_participants ───────────────────────────────────────────────────────
create table public.thread_participants (
  thread_id  uuid not null references public.threads(id) on delete cascade,
  user_id    uuid not null references public.users(id)   on delete cascade,
  primary key (thread_id, user_id)
);

-- ── messages ──────────────────────────────────────────────────────────────────
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references public.threads(id) on delete cascade,
  sender_id  uuid not null references public.users(id)   on delete cascade,
  content    text not null,
  status     text not null default 'sent'
               check (status in ('sent','delivered','read')),
  created_at timestamptz not null default now()
);

-- ── swap_requests ─────────────────────────────────────────────────────────────
create table public.swap_requests (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id   uuid not null references public.users(id) on delete cascade,
  teach_skill  text not null,
  learn_skill  text not null,
  status       text not null default 'pending'
                 check (status in ('pending','accepted','declined','completed')),
  message      text,
  duration     int  not null default 60,
  scheduled_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ── notifications ─────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  read       boolean not null default false,
  link_to    text,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
--  INDEXES
-- ════════════════════════════════════════════════════════════════════════════
create index on public.user_skills(user_id);
create index on public.user_skills(skill_id);
create index on public.thread_participants(user_id);
create index on public.messages(thread_id, created_at);

-- ════════════════════════════════════════════════════════════════════════════
--  RLS — disable for simplicity (anon key has full access)
-- ════════════════════════════════════════════════════════════════════════════
alter table public.users               disable row level security;
alter table public.skills              disable row level security;
alter table public.user_skills         disable row level security;
alter table public.threads             disable row level security;
alter table public.thread_participants disable row level security;
alter table public.messages            disable row level security;
alter table public.swap_requests       disable row level security;
alter table public.notifications       disable row level security;

-- ════════════════════════════════════════════════════════════════════════════
--  SEED SKILLS
-- ════════════════════════════════════════════════════════════════════════════
insert into public.skills (id, name, category, icon, popularity) values
  ('00000001-0000-0000-0000-000000000001', 'Figma',           'design',       'Palette',    95),
  ('00000001-0000-0000-0000-000000000002', 'UI Design',       'design',       'Layout',     85),
  ('00000001-0000-0000-0000-000000000003', 'Photoshop',       'design',       'Image',      75),
  ('00000001-0000-0000-0000-000000000004', 'Illustrator',     'design',       'PenTool',    65),
  ('00000001-0000-0000-0000-000000000005', 'Branding',        'design',       'Tag',        60),
  ('00000001-0000-0000-0000-000000000006', 'Prototyping',     'design',       'Cpu',        55),
  ('00000001-0000-0000-0000-000000000007', 'React',           'development',  'Code',       90),
  ('00000001-0000-0000-0000-000000000008', 'TypeScript',      'development',  'FileCode',   80),
  ('00000001-0000-0000-0000-000000000009', 'HTML / CSS',      'development',  'Globe',      85),
  ('00000001-0000-0000-0000-000000000010', 'Node.js',         'development',  'Server',     70),
  ('00000001-0000-0000-0000-000000000011', 'Python',          'development',  'Terminal',   75),
  ('00000001-0000-0000-0000-000000000012', 'Next.js',         'development',  'ArrowRight', 65),
  ('00000001-0000-0000-0000-000000000013', 'Photography',     'photography',  'Camera',     80),
  ('00000001-0000-0000-0000-000000000014', 'Lightroom',       'photography',  'Sliders',    65),
  ('00000001-0000-0000-0000-000000000015', 'Video Editing',   'photography',  'Video',      70),
  ('00000001-0000-0000-0000-000000000016', 'Color Grading',   'photography',  'Droplet',    55),
  ('00000001-0000-0000-0000-000000000017', 'Guitar',          'music',        'Music',      60),
  ('00000001-0000-0000-0000-000000000018', 'Piano',           'music',        'Music2',     55),
  ('00000001-0000-0000-0000-000000000019', 'Music Production','music',        'Headphones', 50),
  ('00000001-0000-0000-0000-000000000020', 'Marketing',       'marketing',    'Megaphone',  70),
  ('00000001-0000-0000-0000-000000000021', 'Content Writing', 'marketing',    'Edit',       60),
  ('00000001-0000-0000-0000-000000000022', 'SEO',             'marketing',    'Search',     55),
  ('00000001-0000-0000-0000-000000000023', 'Excel',           'productivity', 'Table',      65),
  ('00000001-0000-0000-0000-000000000024', 'Notion',          'productivity', 'BookOpen',   50),
  ('00000001-0000-0000-0000-000000000025', 'Spanish',         'language',     'Languages',  60),
  ('00000001-0000-0000-0000-000000000026', 'Japanese',        'language',     'Flag',       45),
  ('00000001-0000-0000-0000-000000000027', 'Cooking',         'other',        'Utensils',   55),
  ('00000001-0000-0000-0000-000000000028', 'Yoga',            'other',        'Heart',      40)
on conflict (name) do nothing;
