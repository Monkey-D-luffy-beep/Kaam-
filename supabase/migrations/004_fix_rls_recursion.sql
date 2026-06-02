-- ============================================================
-- KAAM - Migration 004: Fix RLS Recursion
-- Run in Supabase SQL Editor
-- ============================================================
-- Root cause: project_members SELECT policy queries project_members,
-- causing infinite recursion. Fix: security definer functions bypass
-- RLS when called inside policies, breaking the recursion chain.

-- ============================================================
-- STEP 1: Create security definer helper functions
-- These query tables WITHOUT triggering RLS, preventing recursion
-- ============================================================

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_project_admin(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'manager')
  );
$$;

-- ============================================================
-- STEP 2: Drop all old policies that cause recursion
-- ============================================================

drop policy if exists "Project members can view membership"   on project_members;
drop policy if exists "Admins can manage project members"     on project_members;
drop policy if exists "Admins can remove project members"     on project_members;
drop policy if exists "Project members can view projects"     on projects;
drop policy if exists "Org members can create projects"       on projects;
drop policy if exists "Admins and owners can update projects" on projects;
drop policy if exists "Owners can delete projects"           on projects;
drop policy if exists "Project members can view tasks"        on tasks;
drop policy if exists "Project members can create tasks"      on tasks;
drop policy if exists "Project members can update tasks"      on tasks;
drop policy if exists "Task creator or admin can delete tasks" on tasks;
drop policy if exists "Project members can view comments"     on task_comments;
drop policy if exists "Project members can add comments"      on task_comments;
drop policy if exists "Organization members can view their org" on organizations;

-- ============================================================
-- STEP 3: Recreate project_members policies (non-recursive)
-- ============================================================

create policy "Project members can view membership"
  on project_members for select
  using (public.is_project_member(project_id));

create policy "Members can be added to projects"
  on project_members for insert
  with check (
    -- Creator adds themselves as owner on new project
    (user_id = auth.uid() and exists (
      select 1 from projects
      where id = project_id and created_by = auth.uid()
    ))
    -- Admins can add anyone
    or public.is_project_admin(project_id)
  );

create policy "Admins or self can remove members"
  on project_members for delete
  using (
    user_id = auth.uid()
    or public.is_project_admin(project_id)
  );

-- ============================================================
-- STEP 4: Recreate projects policies
-- ============================================================

create policy "Project members can view projects"
  on projects for select
  using (public.is_project_member(id));

create policy "Authenticated users can create projects"
  on projects for insert
  with check (created_by = auth.uid());

create policy "Admins can update projects"
  on projects for update
  using (public.is_project_admin(id));

create policy "Owners can delete projects"
  on projects for delete
  using (
    exists (
      select 1 from project_members
      where project_id = id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ============================================================
-- STEP 5: Recreate tasks policies
-- ============================================================

create policy "Project members can view tasks"
  on tasks for select
  using (public.is_project_member(project_id));

create policy "Project members can create tasks"
  on tasks for insert
  with check (
    created_by = auth.uid()
    and public.is_project_member(project_id)
  );

create policy "Project members can update tasks"
  on tasks for update
  using (public.is_project_member(project_id));

create policy "Task creator or admin can delete tasks"
  on tasks for delete
  using (
    created_by = auth.uid()
    or public.is_project_admin(project_id)
  );

-- ============================================================
-- STEP 6: Recreate task_comments policies
-- ============================================================

create policy "Project members can view comments"
  on task_comments for select
  using (
    exists (
      select 1 from tasks t
      where t.id = task_id
        and public.is_project_member(t.project_id)
    )
  );

create policy "Project members can add comments"
  on task_comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from tasks t
      where t.id = task_id
        and public.is_project_member(t.project_id)
    )
  );

-- ============================================================
-- STEP 7: Fix organizations policy
-- ============================================================

create policy "Organization members can view their org"
  on organizations for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from projects p
      where p.organization_id = id
        and public.is_project_member(p.id)
    )
  );
