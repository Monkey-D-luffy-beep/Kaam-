-- ============================================================
-- KAAM - Migration 005: Fix INSERT Policy Chicken-and-Egg
-- ============================================================
-- Problem: project_members INSERT policy checks projects SELECT,
-- but projects SELECT requires being in project_members → deadlock.
-- Fix: simplify project_members INSERT to just require auth.uid().

drop policy if exists "Members can be added to projects" on project_members;

create policy "Members can be added to projects"
  on project_members for insert
  with check (
    -- Any authenticated user can add themselves (project creation flow)
    user_id = auth.uid()
    -- Or an admin can add anyone else
    or public.is_project_admin(project_id)
  );
