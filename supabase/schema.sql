-- ═══════════════════════════════════════════════════════════════════════════
--  SkillSwap — Complete Supabase SQL
--  Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Drop existing tables (clean slate) ─────────────────────────────────────
drop table if exists public.notifications      cascade;
drop table if exists public.swap_requests      cascade;
drop table if exists public.messages           cascade;
drop table if exists public.thread_participants cascade;
drop table if exists public.threads            cascade;
drop table if exists public.user_skills        cascade;
drop table if exists public.skills             cascade;
drop table if exists public.profiles           cascade;

-- ════════════════════════════════════════════════════════════════════════════
--  TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key default uuid_generate_v4(),
  auth_user_id        uuid unique,                      -- links to auth.users
  display_name        text not null,
  username            text unique not null,
  avatar_url          text,
  bio                 text,
  location            text,
  status              text not null default 'offline'
                        check (status in ('online','offline','away','available')),
  gradient_index      int  not null default 0,
  sessions_completed  int  not null default 0,
  rating              numeric(3,2) not null default 0,
  review_count        int  not null default 0,
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ── skills ───────────────────────────────────────────────────────────────────
create table public.skills (
  id         uuid primary key default uuid_generate_v4(),
  name       text unique not null,
  category   text not null default 'other',
  icon       text,
  popularity int  not null default 50
);

-- ── user_skills ──────────────────────────────────────────────────────────────
create table public.user_skills (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  skill_id   uuid not null references public.skills(id)   on delete cascade,
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
  thread_id  uuid not null references public.threads(id)  on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (thread_id, user_id)
);

-- ── messages ──────────────────────────────────────────────────────────────────
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references public.threads(id)  on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  status     text not null default 'sent'
               check (status in ('sent','delivered','read')),
  created_at timestamptz not null default now()
);

-- ── swap_requests ─────────────────────────────────────────────────────────────
create table public.swap_requests (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id   uuid not null references public.profiles(id) on delete cascade,
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
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null
               check (type in ('match','message','swap_request','swap_accepted','session_reminder')),
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
create index on public.notifications(user_id, read);

-- ════════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════
alter table public.profiles           enable row level security;
alter table public.skills             enable row level security;
alter table public.user_skills        enable row level security;
alter table public.threads            enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages           enable row level security;
alter table public.swap_requests      enable row level security;
alter table public.notifications      enable row level security;

-- profiles: anyone can read, only owner can write
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert
  with check (auth.uid() = auth_user_id);
create policy "profiles_update_own"  on public.profiles for update
  using (auth.uid() = auth_user_id);

-- skills: anyone can read, authenticated users can insert
create policy "skills_select_all"    on public.skills for select using (true);
create policy "skills_insert_auth"   on public.skills for insert
  with check (auth.role() = 'authenticated');

-- user_skills: anyone can read, owner can write
create policy "user_skills_select"   on public.user_skills for select using (true);
create policy "user_skills_insert"   on public.user_skills for insert
  with check (
    user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );
create policy "user_skills_delete"   on public.user_skills for delete
  using (
    user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- threads: participants can read
create policy "threads_select"       on public.threads for select
  using (
    id in (select thread_id from public.thread_participants
           where user_id in (select id from public.profiles where auth_user_id = auth.uid()))
  );
create policy "threads_insert"       on public.threads for insert
  with check (auth.role() = 'authenticated');

-- thread_participants: participants can read
create policy "tp_select"            on public.thread_participants for select
  using (
    user_id in (select id from public.profiles where auth_user_id = auth.uid())
    or thread_id in (
      select thread_id from public.thread_participants
      where user_id in (select id from public.profiles where auth_user_id = auth.uid())
    )
  );
create policy "tp_insert"            on public.thread_participants for insert
  with check (auth.role() = 'authenticated');

-- messages: participants can read & insert
create policy "messages_select"      on public.messages for select
  using (
    thread_id in (
      select thread_id from public.thread_participants
      where user_id in (select id from public.profiles where auth_user_id = auth.uid())
    )
  );
create policy "messages_insert"      on public.messages for insert
  with check (
    sender_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- swap_requests: both parties can read
create policy "swaps_select"         on public.swap_requests for select
  using (
    from_user_id in (select id from public.profiles where auth_user_id = auth.uid())
    or to_user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );
create policy "swaps_insert"         on public.swap_requests for insert
  with check (
    from_user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- notifications: only owner
create policy "notifs_select"        on public.notifications for select
  using (user_id in (select id from public.profiles where auth_user_id = auth.uid()));

-- ════════════════════════════════════════════════════════════════════════════
--  SEED DATA  (mock users that match the frontend mock profiles)
-- ════════════════════════════════════════════════════════════════════════════

-- ── Skills ───────────────────────────────────────────────────────────────────
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

-- ── Demo profiles (no auth_user_id — visible to all) ─────────────────────────
insert into public.profiles
  (id, auth_user_id, display_name, username, bio, location, status,
   gradient_index, sessions_completed, rating, review_count, is_verified)
values
  ('00000002-0000-0000-0000-000000000001', null,
   'Ananya Krishnan', 'ananya',
   'Visual storyteller from Bangalore. Teaching photography, learning UI design.',
   'Bangalore', 'online', 1, 24, 4.90, 32, true),

  ('00000002-0000-0000-0000-000000000002', null,
   'Luca Moretti', 'luca',
   'Frontend engineer & design-systems nerd. Teaching React, learning motion design.',
   'Berlin', 'available', 2, 16, 4.50, 18, true),

  ('00000002-0000-0000-0000-000000000003', null,
   'Priya Nair', 'priya',
   'Illustrator & creative director from Mumbai.',
   'Mumbai', 'online', 3, 12, 4.80, 20, false),

  ('00000002-0000-0000-0000-000000000004', null,
   'Marco Silva', 'marco',
   'Full-stack developer learning guitar and music production.',
   'Lisbon', 'online', 4, 9, 4.60, 14, false),

  ('00000002-0000-0000-0000-000000000005', null,
   'Yuki Tanaka', 'yuki',
   'Motion designer and illustrator. Learning Python and web development.',
   'Tokyo', 'away', 0, 31, 4.95, 48, true),

  ('00000002-0000-0000-0000-000000000006', null,
   'Sara Osei', 'sara',
   'Content strategist and marketer. Learning Figma to better collaborate with design teams.',
   'Accra', 'online', 1, 7, 4.40, 9, false)
on conflict (username) do nothing;

-- ── user_skills for demo profiles ────────────────────────────────────────────
insert into public.user_skills (user_id, skill_id, kind, level) values
  -- Ananya: teaches photography/lightroom/color grading, learns figma/ui
  ('00000002-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000013','teach','advanced'),
  ('00000002-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000014','teach','advanced'),
  ('00000002-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000016','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000001','learn', null),
  ('00000002-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000002','learn', null),

  -- Luca: teaches react/typescript/next.js, learns prototyping/branding
  ('00000002-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000007','teach','advanced'),
  ('00000002-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000008','teach','advanced'),
  ('00000002-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000012','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000006','learn', null),
  ('00000002-0000-0000-0000-000000000002','00000001-0000-0000-0000-000000000005','learn', null),

  -- Priya: teaches illustrator/photoshop/branding, learns html/figma
  ('00000002-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000004','teach','expert'),
  ('00000002-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000003','teach','advanced'),
  ('00000002-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000005','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000009','learn', null),
  ('00000002-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000001','learn', null),

  -- Marco: teaches react/node.js/python, learns guitar/music production
  ('00000002-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000007','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000010','teach','advanced'),
  ('00000002-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000011','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000017','learn', null),
  ('00000002-0000-0000-0000-000000000004','00000001-0000-0000-0000-000000000019','learn', null),

  -- Yuki: teaches video editing/color grading/illustrator, learns python/html
  ('00000002-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000015','teach','expert'),
  ('00000002-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000016','teach','expert'),
  ('00000002-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000004','teach','advanced'),
  ('00000002-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000011','learn', null),
  ('00000002-0000-0000-0000-000000000005','00000001-0000-0000-0000-000000000009','learn', null),

  -- Sara: teaches marketing/content writing/seo, learns figma/ui design
  ('00000002-0000-0000-0000-000000000006','00000001-0000-0000-0000-000000000020','teach','expert'),
  ('00000002-0000-0000-0000-000000000006','00000001-0000-0000-0000-000000000021','teach','advanced'),
  ('00000002-0000-0000-0000-000000000006','00000001-0000-0000-0000-000000000022','teach','intermediate'),
  ('00000002-0000-0000-0000-000000000006','00000001-0000-0000-0000-000000000001','learn', null),
  ('00000002-0000-0000-0000-000000000006','00000001-0000-0000-0000-000000000002','learn', null)
on conflict (user_id, skill_id, kind) do nothing;

-- ── Demo thread + messages between Ananya and Luca ───────────────────────────
insert into public.threads (id) values
  ('00000003-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.thread_participants (thread_id, user_id) values
  ('00000003-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000001'),
  ('00000003-0000-0000-0000-000000000001','00000002-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.messages (id, thread_id, sender_id, content, status) values
  ('00000004-0000-0000-0000-000000000001',
   '00000003-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000001',
   'Hey Luca! I saw you teach React. I''d love to swap photography lessons for React basics.',
   'read'),
  ('00000004-0000-0000-0000-000000000002',
   '00000003-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000002',
   'That sounds amazing Ananya! When are you free this week?',
   'read'),
  ('00000004-0000-0000-0000-000000000003',
   '00000003-0000-0000-0000-000000000001',
   '00000002-0000-0000-0000-000000000001',
   'I''m free Thursday evening or Saturday morning. Which works better for you?',
   'delivered')
on conflict do nothing;

-- ════════════════════════════════════════════════════════════════════════════
--  AUTO-CREATE PROFILE ON SIGN UP  (trigger)
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  uname text;
begin
  -- Use metadata username if provided, else derive from email
  uname := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Ensure uniqueness by appending random suffix if taken
  if exists (select 1 from public.profiles where username = uname) then
    uname := uname || '_' || floor(random() * 9000 + 1000)::text;
  end if;

  insert into public.profiles (
    auth_user_id, display_name, username,
    status, gradient_index, sessions_completed, rating, review_count, is_verified
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    uname,
    'online', floor(random() * 5)::int, 0, 0, 0, false
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
