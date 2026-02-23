-- Add deadline_reminder_days to years table
-- Allows admins to configure when deadline reminders are sent (e.g., 7, 3, 1 days before deadline)
ALTER TABLE "public"."years"
ADD COLUMN IF NOT EXISTS "deadline_reminder_days" INTEGER[] DEFAULT ARRAY[7, 3, 1];

COMMENT ON COLUMN "public"."years"."deadline_reminder_days" IS 'Days before submission_date to send deadline reminders (configurable in admin panel)';

-- Add reminders_sent to projects table
-- Tracks which reminder intervals have been sent to avoid duplicates
ALTER TABLE "public"."projects"
ADD COLUMN IF NOT EXISTS "reminders_sent" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

COMMENT ON COLUMN "public"."projects"."reminders_sent" IS 'List of reminder days that have been sent for this project (e.g., [7, 3] means 7-day and 3-day reminders were sent)';

-- Create index on reminders_sent for efficient queries
CREATE INDEX IF NOT EXISTS "idx_projects_reminders_sent" ON "public"."projects" USING GIN ("reminders_sent");

-- Update existing years to have default reminder intervals
UPDATE "public"."years"
SET "deadline_reminder_days" = ARRAY[7, 3, 1]
WHERE "deadline_reminder_days" IS NULL;
