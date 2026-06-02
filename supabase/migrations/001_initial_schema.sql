-- ============================================================
-- KAAM - Initial Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor or via supabase db push

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('todo', 'in_progress', 'done');
create type project_status as enum ('active', 'archived');
create type member_role as enum ('owner', 'admin', 'member');
create type invitation_status as enum ('pending', 'accepted', 'declined', 'expired');

-- ============================================================
-- PROFILES
-- Mirror of auth.users with extra metadata
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_email_idx on profiles(email);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  owner_id    uuid not null references profiles(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index organizations_owner_idx on organizations(owner_id);
create index organizations_slug_idx on organizations(slug);

-- ============================================================
-- PROJECTS
-- ============================================================

create table projects (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  description      text,
  status           project_status not null default 'active',
  color            text not null default '#6366f1',
  created_by       uuid not null references profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index projects_organization_idx on projects(organization_id);
create index projects_status_idx on projects(status);
create index projects_created_by_idx on projects(created_by);

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================

create table project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        member_role not null default 'member',
  created_at  timestamptz not null default now(),
  unique(project_id, user_id)
);

create index project_members_project_idx on project_members(project_id);
create index project_members_user_idx on project_members(user_id);

-- ============================================================
-- TASKS
-- ============================================================

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       task_status not null default 'todo',
  priority     priority not null default 'medium',
  assignee_id  uuid references profiles(id) on delete set null,
  due_date     date,
  position     integer not null default 0,
  created_by   uuid not null references profiles(id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index tasks_project_idx on tasks(project_id);
create index tasks_status_idx on tasks(status);
create index tasks_assignee_idx on tasks(assignee_id);
create index tasks_due_date_idx on tasks(due_date) where due_date is not null;
create index tasks_position_idx on tasks(project_id, status, position);
create index tasks_created_by_idx on tasks(created_by);

-- ============================================================
-- TASK COMMENTS
-- ============================================================

create table task_comments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index task_comments_task_idx on task_comments(task_id);
create index task_comments_user_idx on task_comments(user_id);

-- ============================================================
-- INVITATIONS
-- ============================================================

create table invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  project_id       uuid references projects(id) on delete cascade,
  email            text not null,
  role             member_role not null default 'member',
  status           invitation_status not null default 'pending',
  invited_by       uuid not null references profiles(id) on delete cascade,
  token            text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at       timestamptz not null default (now() + interval '7 days'),
  created_at       timestamptz not null default now()
);

create index invitations_organization_idx on invitations(organization_id);
create index invitations_email_idx on invitations(email);
create index invitations_token_idx on invitations(token);
create index invitations_status_idx on invitations(status);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

create table activity_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  project_id       uuid references projects(id) on delete set null,
  task_id          uuid references tasks(id) on delete set null,
  user_id          uuid not null references profiles(id) on delete cascade,
  action           text not null,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

create index activity_logs_organization_idx on activity_logs(organization_id);
create index activity_logs_project_idx on activity_logs(project_id) where project_id is not null;
create index activity_logs_task_idx on activity_logs(task_id) where task_id is not null;
create index activity_logs_user_idx on activity_logs(user_id);
create index activity_logs_created_at_idx on activity_logs(created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

create trigger task_comments_updated_at
  before update on task_comments
  for each row execute function update_updated_at();

-- ============================================================
-- PROFILE AUTO-CREATE TRIGGER
-- Creates a profile row when a new user signs up via Supabase Auth
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
alter table invitations enable row level security;
alter table activity_logs enable row level security;

-- ---- PROFILES ----

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view profiles of teammates"
  on profiles for select
  using (
    exists (
      select 1 from project_members pm1
      join project_members pm2 on pm1.project_id = pm2.project_id
      where pm1.user_id = auth.uid()
        and pm2.user_id = profiles.id
    )
  );

-- ---- ORGANIZATIONS ----

create policy "Organization members can view their org"
  on organizations for select
  using (
    exists (
      select 1 from projects p
      join project_members pm on pm.project_id = p.id
      where p.organization_id = organizations.id
        and pm.user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "Users can create organizations"
  on organizations for insert
  with check (owner_id = auth.uid());

create policy "Owners can update their org"
  on organizations for update
  using (owner_id = auth.uid());

-- ---- PROJECTS ----

create policy "Project members can view projects"
  on projects for select
  using (
    exists (
      select 1 from project_members
      where project_id = projects.id and user_id = auth.uid()
    )
  );

create policy "Org members can create projects"
  on projects for insert
  with check (created_by = auth.uid());

create policy "Admins and owners can update projects"
  on projects for update
  using (
    exists (
      select 1 from project_members
      where project_id = projects.id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "Owners can delete projects"
  on projects for delete
  using (
    exists (
      select 1 from project_members
      where project_id = projects.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ---- PROJECT MEMBERS ----

create policy "Project members can view membership"
  on project_members for select
  using (
    exists (
      select 1 from project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
    )
  );

create policy "Admins can manage project members"
  on project_members for insert
  with check (
    exists (
      select 1 from project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
        and pm.role in ('owner', 'admin')
    )
  );

create policy "Admins can remove project members"
  on project_members for delete
  using (
    exists (
      select 1 from project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
        and pm.role in ('owner', 'admin')
    )
    or user_id = auth.uid()
  );

-- ---- TASKS ----

create policy "Project members can view tasks"
  on tasks for select
  using (
    exists (
      select 1 from project_members
      where project_id = tasks.project_id and user_id = auth.uid()
    )
  );

create policy "Project members can create tasks"
  on tasks for insert
  with check (
    exists (
      select 1 from project_members
      where project_id = tasks.project_id and user_id = auth.uid()
    )
    and created_by = auth.uid()
  );

create policy "Project members can update tasks"
  on tasks for update
  using (
    exists (
      select 1 from project_members
      where project_id = tasks.project_id and user_id = auth.uid()
    )
  );

create policy "Task creator or admin can delete tasks"
  on tasks for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from project_members
      where project_id = tasks.project_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ---- TASK COMMENTS ----

create policy "Project members can view comments"
  on task_comments for select
  using (
    exists (
      select 1 from tasks t
      join project_members pm on pm.project_id = t.project_id
      where t.id = task_comments.task_id and pm.user_id = auth.uid()
    )
  );

create policy "Project members can add comments"
  on task_comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from tasks t
      join project_members pm on pm.project_id = t.project_id
      where t.id = task_comments.task_id and pm.user_id = auth.uid()
    )
  );

create policy "Comment authors can update their comments"
  on task_comments for update
  using (user_id = auth.uid());

create policy "Comment authors can delete their comments"
  on task_comments for delete
  using (user_id = auth.uid());

-- ---- INVITATIONS ----

create policy "Admins can view invitations"
  on invitations for select
  using (
    invited_by = auth.uid()
    or exists (
      select 1 from project_members pm
      join projects p on p.id = pm.project_id
      where p.organization_id = invitations.organization_id
        and pm.user_id = auth.uid()
        and pm.role in ('owner', 'admin')
    )
  );

create policy "Admins can create invitations"
  on invitations for insert
  with check (
    invited_by = auth.uid()
  );

create policy "Admins can update invitations"
  on invitations for update
  using (
    invited_by = auth.uid()
    or exists (
      select 1 from project_members pm
      join projects p on p.id = pm.project_id
      where p.organization_id = invitations.organization_id
        and pm.user_id = auth.uid()
        and pm.role in ('owner', 'admin')
    )
  );

-- ---- ACTIVITY LOGS ----

create policy "Project members can view activity"
  on activity_logs for select
  using (
    exists (
      select 1 from projects p
      join project_members pm on pm.project_id = p.id
      where p.organization_id = activity_logs.organization_id
        and pm.user_id = auth.uid()
    )
  );

create policy "System inserts activity logs"
  on activity_logs for insert
  with check (user_id = auth.uid());
