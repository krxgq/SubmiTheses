-- Fix status enum by removing 'submitted' value
-- Run this manually before prisma db push

-- Step 1: Update any rows that might have 'submitted' status to 'draft'
UPDATE projects SET status = 'draft' WHERE status = 'submitted';

-- Step 2: Remove default temporarily
ALTER TABLE projects ALTER COLUMN status DROP DEFAULT;

-- Step 3: Create new enum type
CREATE TYPE status_fixed AS ENUM ('draft', 'locked', 'public');

-- Step 4: Convert column to new enum
ALTER TABLE projects 
  ALTER COLUMN status TYPE status_fixed 
  USING (status::text::status_fixed);

-- Step 5: Drop old enum and rename new one
DROP TYPE status;
ALTER TYPE status_fixed RENAME TO status;

-- Step 6: Restore default
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'draft';

-- Step 7: Create project_signups table
CREATE TABLE IF NOT EXISTS project_signups (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  UNIQUE(project_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_project_signups_project ON project_signups(project_id);
CREATE INDEX IF NOT EXISTS idx_project_signups_student ON project_signups(student_id);
