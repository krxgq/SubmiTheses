-- Seed script for SumbiTheses database
-- This creates test data for development and testing

-- Note: Users must be created in Supabase Auth first
-- This script assumes you have already created test users via Supabase Auth UI or API
-- Replace the UUIDs below with actual user IDs from your Supabase auth.users table

-- For this example, we'll use placeholder UUIDs
-- In production, you would:
-- 1. Create users via Supabase Auth
-- 2. Get their UUIDs
-- 3. Insert into public.users with those UUIDs

BEGIN;

-- Create academic year
INSERT INTO public.years (id, school_id, assignment_date, submission_date, feedback_date, created_at)
VALUES
  (1, NULL, '2024-09-01 00:00:00+00', '2025-05-31 23:59:59+00', '2025-06-30 23:59:59+00', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test users in public.users (assumes auth.users already exist)
-- You need to replace these UUIDs with real ones from auth.users
-- For now, we'll create placeholder entries

-- Note: In a real scenario, you'd first create users in Supabase Auth Dashboard
-- then link them here. For testing, we'll insert some example data structure.

-- Example Projects (using system-generated UUIDs for demo)
-- In production, replace supervisor_id and opponent_id with real user UUIDs

INSERT INTO public.projects (id, title, supervisor_id, opponent_id, subject, description, main_documentation, updated_at)
VALUES
  (
    1,
    'AI-Powered Code Review System',
    '00000000-0000-0000-0000-000000000001', -- Replace with real supervisor UUID
    '00000000-0000-0000-0000-000000000002', -- Replace with real opponent UUID
    'Computer Science',
    'Development of an AI-powered system for automated code review and quality assessment using machine learning algorithms.',
    'https://github.com/example/code-review-ai',
    NOW()
  ),
  (
    2,
    'Blockchain-Based Supply Chain Management',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Information Systems',
    'Design and implementation of a blockchain-based supply chain tracking system for pharmaceutical products.',
    NULL,
    NOW()
  ),
  (
    3,
    'Smart Home Energy Optimization',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Electrical Engineering',
    'IoT-based system for optimizing energy consumption in smart homes using predictive analytics and machine learning.',
    'https://drive.google.com/example/smart-home',
    NOW()
  ),
  (
    4,
    'Natural Language Processing for Legal Documents',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Computer Science',
    'NLP system for automated analysis and classification of legal documents with entity recognition and summarization.',
    NULL,
    NOW()
  ),
  (
    5,
    'Augmented Reality Educational Platform',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Computer Science',
    'AR-based educational platform for interactive learning in STEM subjects with gamification elements.',
    'https://github.com/example/ar-edu',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Link students to projects
INSERT INTO public.project_students (project_id, student_id, created_at)
VALUES
  (1, '00000000-0000-0000-0000-000000000004', NOW()),
  (2, '00000000-0000-0000-0000-000000000005', NOW()),
  (3, '00000000-0000-0000-0000-000000000006', NOW()),
  (4, '00000000-0000-0000-0000-000000000007', NOW()),
  (5, '00000000-0000-0000-0000-000000000008', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add external links
INSERT INTO public.external_links (project_id, url, title, description, added_at, updated_at)
VALUES
  (1, 'https://github.com/example/code-review-ai', 'GitHub Repository', 'Main project repository', NOW(), NOW()),
  (1, 'https://docs.example.com/code-review', 'Project Documentation', 'Technical documentation and API reference', NOW(), NOW()),
  (2, 'https://ethereum.org/', 'Ethereum', 'Blockchain platform used for implementation', NOW(), NOW()),
  (3, 'https://example.com/smart-home-demo', 'Live Demo', 'Working prototype demonstration', NOW(), NOW()),
  (5, 'https://unity.com/', 'Unity Engine', 'AR development platform', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some reviews
INSERT INTO public.reviews (project_id, reviewer_id, comments, submitted_at, updated_at)
VALUES
  (1, '00000000-0000-0000-0000-000000000002', 'Excellent work on the AI model architecture. The code quality metrics are well-designed and the evaluation methodology is sound. Minor improvements needed in the documentation.', NOW() - INTERVAL '2 days', NOW()),
  (2, '00000000-0000-0000-0000-000000000003', 'Strong implementation of blockchain concepts. The smart contracts are well-written and secure. Consider adding more test coverage for edge cases.', NOW() - INTERVAL '1 day', NOW()),
  (3, '00000000-0000-0000-0000-000000000001', 'Innovative approach to energy optimization. The IoT integration is seamless and the predictive models show promising results. Great presentation of findings.', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add scales for grading
INSERT INTO public.scales (id, maxVal, name, desc, created_at)
VALUES
  (1, 100, 'Implementation Quality', 'Quality of code, architecture, and technical implementation', NOW()),
  (2, 100, 'Research & Analysis', 'Depth of research, literature review, and problem analysis', NOW()),
  (3, 100, 'Innovation', 'Originality and innovative aspects of the solution', NOW()),
  (4, 100, 'Documentation', 'Quality and completeness of documentation', NOW()),
  (5, 100, 'Presentation', 'Quality of thesis defense and presentation skills', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add grades for some projects
INSERT INTO public.grades (value, year_id, project_id, reviewer_id, scale_id, created_at)
VALUES
  (85, 1, 1, '00000000-0000-0000-0000-000000000001', 1, NOW()),
  (90, 1, 1, '00000000-0000-0000-0000-000000000001', 2, NOW()),
  (88, 1, 1, '00000000-0000-0000-0000-000000000001', 3, NOW()),
  (82, 1, 2, '00000000-0000-0000-0000-000000000001', 1, NOW()),
  (87, 1, 2, '00000000-0000-0000-0000-000000000001', 2, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Instructions for actual usage:
-- 1. Create users in Supabase Auth Dashboard (or via API)
-- 2. Copy their UUIDs
-- 3. Replace all placeholder UUIDs (00000000-...) with real UUIDs
-- 4. Run this script via: psql -f seed.sql
