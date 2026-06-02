-- ============================================================
-- KAAM - Migration 002: Task Enhancements
-- Run this in Supabase SQL Editor AFTER migration 001
-- ============================================================

-- ---- NEW ENUMS ----

create type effort_level as enum ('quick', 'medium', 'large');
create type approval_status as enum ('none', 'pending_approval', 'approved', 'rejected');

-- Add manager role to existing member_role enum
alter type member_role add value if not exists 'manager' after 'admin';

-- ---- ALTER TASKS TABLE ----

alter table tasks
  add column effort effort_level not null default 'medium',
  add column approval_status approval_status not null default 'none',
  add column approved_by uuid references profiles(id) on delete set null,
  add column approval_note text;

-- ---- NEW INDEXES ----

create index tasks_approval_idx on tasks(approval_status)
  where approval_status != 'none';

create index tasks_effort_idx on tasks(effort);

-- ---- RLS: managers can view all project members tasks ----
-- (Managers already inherit member visibility from existing policies.
--  The cross-project query is gated server-side via join on project_members.)

-- ---- UPDATED RLS: managers can update tasks (same as admins) ----
-- The existing "Project members can update tasks" policy already covers managers
-- since managers are project members. No change needed.

-- ---- RLS: only managers/admins/owners can approve tasks ----
-- Approval is handled server-side in Server Actions with role checks.
-- No separate RLS policy needed since update is already allowed for members
-- and we gate approval logic in application code.
