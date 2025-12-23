-- Add performance indexes for frequently queried columns

-- Projects: Add index on updated_at for sorting recent projects
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- Projects: Composite index for status + year queries
CREATE INDEX IF NOT EXISTS idx_projects_status_year ON public.projects(status, year_id) WHERE status IS NOT NULL;

-- Projects: Composite index for student + status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_projects_student_status ON public.projects(student_id, status) WHERE student_id IS NOT NULL;

-- Grades: Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON public.grades(created_at DESC);

-- Grades: Composite for project + reviewer queries
CREATE INDEX IF NOT EXISTS idx_grades_project_reviewer ON public.grades(project_id, reviewer_id);

-- Reviews: Add index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_submitted_at ON public.reviews(submitted_at DESC);

-- Reviews: Composite for project + reviewer queries  
CREATE INDEX IF NOT EXISTS idx_reviews_project_reviewer ON public.reviews(project_id, reviewer_id);

-- Attachments: Add index on uploaded_at for sorting
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON public.attachments(uploaded_at DESC);

-- External links: Add index on added_at for sorting
CREATE INDEX IF NOT EXISTS idx_external_links_added_at ON public.external_links(added_at DESC);

-- Subjects: Add index on is_active for filtering active subjects
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON public.subjects(is_active) WHERE is_active = true;

-- Project descriptions: Add index on updated_at
CREATE INDEX IF NOT EXISTS idx_project_descriptions_updated_at ON public.project_descriptions(updated_at DESC);

-- Comments explaining the indexes
COMMENT ON INDEX public.idx_projects_updated_at IS 'Performance: Sort projects by last update';
COMMENT ON INDEX public.idx_projects_status_year IS 'Performance: Filter projects by status and year';
COMMENT ON INDEX public.idx_projects_student_status IS 'Performance: Student project queries with status';
COMMENT ON INDEX public.idx_grades_created_at IS 'Performance: Sort grades by creation date';
COMMENT ON INDEX public.idx_grades_project_reviewer IS 'Performance: Grade queries by project and reviewer';
COMMENT ON INDEX public.idx_reviews_submitted_at IS 'Performance: Sort reviews by submission date';
COMMENT ON INDEX public.idx_reviews_project_reviewer IS 'Performance: Review queries by project and reviewer';
COMMENT ON INDEX public.idx_attachments_uploaded_at IS 'Performance: Sort attachments by upload date';
COMMENT ON INDEX public.idx_external_links_added_at IS 'Performance: Sort links by added date';
COMMENT ON INDEX public.idx_subjects_is_active IS 'Performance: Filter active subjects';
COMMENT ON INDEX public.idx_project_descriptions_updated_at IS 'Performance: Sort descriptions by update date';
