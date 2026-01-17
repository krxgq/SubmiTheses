--
-- Migration: Remove 'submitted' status and is_locked boolean field
-- Description: Simplify status model by removing redundant fields
-- Date: 2026-01-10
--

-- 1. Update status enum: Remove 'submitted', keep only 'draft', 'locked', 'public'
ALTER TYPE public.status RENAME TO status_old;

CREATE TYPE public.status AS ENUM (
    'draft',
    'locked',
    'public'
);

-- 2. Migrate existing 'submitted' projects to 'locked'
-- This ensures projects that were submitted are now locked (frozen state)
UPDATE public.projects 
SET status = 'locked'::text
WHERE status = 'submitted';

-- 3. Update projects.status column to use new enum
ALTER TABLE public.projects 
  ALTER COLUMN status TYPE public.status 
  USING status::text::public.status;

-- 4. Drop old enum type
DROP TYPE public.status_old;

-- 5. Remove is_locked boolean field (status = 'locked' serves this purpose)
-- First drop the index
DROP INDEX IF EXISTS public.idx_projects_is_locked;

-- Then drop the column
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_locked;

-- 6. Rename submitted_at to locked_at in reviews table (for clarity)
ALTER TABLE public.reviews RENAME COLUMN submitted_at TO locked_at;

-- 7. Update index on reviews
DROP INDEX IF EXISTS public.idx_reviews_submitted_at;
CREATE INDEX idx_reviews_locked_at ON public.reviews USING btree (locked_at DESC);

-- 8. Update comments
COMMENT ON COLUMN public.projects.status IS 'Project status: draft (editable), locked (frozen for review/grading), or public (published)';
COMMENT ON COLUMN public.projects.locked_at IS 'Timestamp when project was locked (auto-locked at deadline or manually by supervisor)';
COMMENT ON COLUMN public.projects.locked_by IS 'User who locked the project (supervisor/admin)';
COMMENT ON COLUMN public.reviews.locked_at IS 'Timestamp when review was submitted';

-- 9. Update activity_action_type enum comment
COMMENT ON TYPE public.activity_action_type IS 'Actions that can be logged: project_submitted is now handled via status change to locked';
