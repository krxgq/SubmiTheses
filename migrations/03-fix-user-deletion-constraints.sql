-- Migration: Fix user deletion constraints
-- This allows deletion of users (including those who haven't accepted invitations)
-- by unassigning them from projects before deletion

-- First, make supervisor_id nullable (it was NOT NULL)
ALTER TABLE public.projects
  ALTER COLUMN supervisor_id DROP NOT NULL;

-- Drop existing constraints
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS fk_projects_supervisor;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS fk_projects_opponent;

ALTER TABLE public.grades
  DROP CONSTRAINT IF EXISTS fk_grades_reviewer;

-- Recreate constraints with SET NULL for projects (allows deletion, nullifies references)
ALTER TABLE public.projects
  ADD CONSTRAINT fk_projects_supervisor
  FOREIGN KEY (supervisor_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;

COMMENT ON CONSTRAINT fk_projects_supervisor ON public.projects IS
  'Supervisor reference - set to NULL if user is deleted';

ALTER TABLE public.projects
  ADD CONSTRAINT fk_projects_opponent
  FOREIGN KEY (opponent_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;

COMMENT ON CONSTRAINT fk_projects_opponent ON public.projects IS
  'Opponent reference - set to NULL if user is deleted';

-- For grades, CASCADE makes more sense - if reviewer is deleted, their grades should be removed
ALTER TABLE public.grades
  ADD CONSTRAINT fk_grades_reviewer
  FOREIGN KEY (reviewer_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_grades_reviewer ON public.grades IS
  'Reviewer reference - cascade delete grades if reviewer is deleted';
