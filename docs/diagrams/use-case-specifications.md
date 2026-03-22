# Use Case Specifications - SumbiTheses

---

## UC01: View Public Projects

| Field | Description |
|-------|-------------|
| **Short Description** | Guest browses published thesis projects without authentication. |
| **Actors** | Guest (Public Visitor) |
| **Triggering Conditions** | User navigates to the public projects page. |
| **Main Flow** | 1. System displays a list of projects with status `public`. 2. User can search/filter by title, year, or subject. 3. User selects a project to view details (title, description, attachments, grades). |
| **Alternative Flows** | No public projects exist → system shows empty state message. |
| **Completion Conditions** | User has viewed the project listing or detail page. |

---

## UC02: Download Public Attachments

| Field | Description |
|-------|-------------|
| **Short Description** | Guest downloads an attachment from a published project. |
| **Actors** | Guest |
| **Triggering Conditions** | User clicks download on a public project's attachment. |
| **Main Flow** | 1. System generates a pre-signed S3 download URL (1h expiry). 2. Browser initiates file download. |
| **Alternative Flows** | Attachment not found → 404 error. S3 service unavailable → error message. |
| **Completion Conditions** | File download begins or error is displayed. |

---

## UC03: Login (Local)

| Field | Description |
|-------|-------------|
| **Short Description** | User authenticates using email and password. |
| **Actors** | Guest |
| **Triggering Conditions** | User submits login form with email and password. |
| **Main Flow** | 1. System validates input (Zod schema). 2. System finds user by email in database. 3. System compares password with bcrypt hash. 4. System generates JWT access token (1h) and refresh token (7d). 5. System sets httpOnly cookies and updates `last_login`. 6. User is redirected to dashboard. |
| **Alternative Flows** | Invalid credentials → 401 Unauthorized. Rate limit exceeded (20/15min) → 429 Too Many Requests. User has `microsoft`-only auth provider → error suggesting Microsoft login. |
| **Completion Conditions** | User is authenticated with valid JWT cookies set. |

---

## UC04: Login (Microsoft OAuth)

| Field | Description |
|-------|-------------|
| **Short Description** | User authenticates via Microsoft Entra ID (Azure AD) using PKCE flow. |
| **Actors** | Guest |
| **Triggering Conditions** | User clicks "Login with Microsoft" button. |
| **Main Flow** | 1. System generates PKCE code_verifier and code_challenge. 2. System redirects to Microsoft authorization URL. 3. User authenticates on Microsoft login page. 4. Microsoft redirects back with authorization code. 5. System exchanges code for tokens using code_verifier. 6. System validates ID token signature (JWKS). 7. System extracts email, name, microsoft_id from token. 8. System finds or creates user (role assigned by email domain: `@delta-studenti.cz` → student, `@delta-skola.cz` → teacher). 9. System generates JWT tokens and sets cookies. |
| **Alternative Flows** | User already exists with same email → accounts are linked automatically. State parameter mismatch → CSRF error. Invalid domain → registration rejected. |
| **Completion Conditions** | User is authenticated; Microsoft account is linked to local profile. |

---

## UC05: Register

| Field | Description |
|-------|-------------|
| **Short Description** | New user creates an account with email and password. |
| **Actors** | Guest |
| **Triggering Conditions** | User submits registration form. |
| **Main Flow** | 1. System validates input fields. 2. System checks email uniqueness. 3. System hashes password with bcrypt (10 rounds). 4. System creates user record with auto-verified email. 5. System generates JWT tokens and logs user in. |
| **Alternative Flows** | Email already exists → 409 Conflict. Rate limit exceeded (10/hour) → 429. Weak password → validation error. |
| **Completion Conditions** | User account is created and user is logged in. |

---

## UC06: Setup Password (Invitation)

| Field | Description |
|-------|-------------|
| **Short Description** | Invited user sets their password using the invitation token from email. |
| **Actors** | Guest (invited user) |
| **Triggering Conditions** | User clicks invitation link in email containing a setup token. |
| **Main Flow** | 1. System validates invitation token (not expired, exists in DB). 2. System displays password setup form. 3. User enters and confirms new password. 4. System hashes password, saves it, and clears the token. 5. System generates JWT tokens and redirects to dashboard. |
| **Alternative Flows** | Token expired → error with option to request resend. Token invalid → 401. |
| **Completion Conditions** | User has a password set and is logged into the system. |

---

## UC07: Link Microsoft Account

| Field | Description |
|-------|-------------|
| **Short Description** | Authenticated user links their Microsoft account to their local profile. |
| **Actors** | Student, Teacher, Admin |
| **Triggering Conditions** | User clicks "Link Microsoft Account" in profile settings. |
| **Main Flow** | 1. System initiates Microsoft OAuth flow (same as UC04). 2. After Microsoft auth, system verifies the Microsoft email matches the local account email. 3. System updates user: sets `microsoft_id`, changes `auth_provider` to `both`. |
| **Alternative Flows** | Email mismatch → linking rejected. Microsoft account already linked to another user → error. |
| **Completion Conditions** | User can now log in via both local password and Microsoft OAuth. |

---

## UC08: Set Password (MS-only User)

| Field | Description |
|-------|-------------|
| **Short Description** | User who registered via Microsoft OAuth sets a local password for dual auth. |
| **Actors** | Student, Teacher |
| **Triggering Conditions** | Microsoft-only user navigates to password settings. |
| **Main Flow** | 1. System verifies user currently has `auth_provider = microsoft`. 2. User enters and confirms new password. 3. System hashes password and updates `auth_provider` to `both`. |
| **Alternative Flows** | User already has local password → redirected to password change instead. |
| **Completion Conditions** | User's `auth_provider` is updated to `both`. |

---

## UC09: Create Project

| Field | Description |
|-------|-------------|
| **Short Description** | Student or teacher creates a new thesis project in draft status. |
| **Actors** | Student, Teacher, Admin |
| **Triggering Conditions** | User clicks "Create Project" and submits the project form. |
| **Main Flow** | 1. User fills in title, subject, description, and optionally supervisor/opponent. 2. User optionally adds project description (topic, goal, specification, schedule, criteria). 3. System creates project with `status = draft`. 4. System logs activity (action: `create`). 5. System redirects to the new project's detail page. |
| **Alternative Flows** | Validation error (missing required fields) → form error displayed. Student tries to assign themselves as supervisor → rejected. |
| **Completion Conditions** | Project exists in database with status `draft`. |

---

## UC10: Edit Project

| Field | Description |
|-------|-------------|
| **Short Description** | Authorized user modifies an existing project's details. |
| **Actors** | Student (own draft), Supervisor (supervised, draft/locked), Admin (any) |
| **Triggering Conditions** | User opens edit form for a project. |
| **Main Flow** | 1. System verifies user has modify permission (role + ownership + status check). 2. User updates fields (title, description, supervisor, opponent, etc.). 3. System saves changes and logs activity. |
| **Alternative Flows** | Student tries to edit locked project → 403 Forbidden. Teacher tries to edit non-supervised project → 403. Project not found → 404. |
| **Completion Conditions** | Project is updated with new values. |

---

## UC11: Delete Project

| Field | Description |
|-------|-------------|
| **Short Description** | Authorized user deletes a project and all its related data. |
| **Actors** | Supervisor (own drafts only), Admin (any project) |
| **Triggering Conditions** | User clicks delete and confirms the action. |
| **Main Flow** | 1. System verifies delete permission. 2. System cascade-deletes project and all related records (attachments, grades, reviews, signups, logs, description). 3. S3 attachments remain (orphaned). |
| **Alternative Flows** | Teacher tries to delete non-draft project → 403. Student tries to delete → 403. |
| **Completion Conditions** | Project and related records are removed from database. |

---

## UC12: Upload Attachments

| Field | Description |
|-------|-------------|
| **Short Description** | User uploads files to a project via pre-signed S3 URLs. |
| **Actors** | Student (own project), Admin |
| **Triggering Conditions** | User selects files in the attachment upload form. |
| **Main Flow** | 1. System validates file type (whitelist) and size. 2. System generates pre-signed S3 PUT URL (5min expiry) with key `projects/{id}/{timestamp}-{filename}`. 3. Frontend uploads file directly to S3. 4. Frontend sends metadata to API. 5. System creates attachment record in database. |
| **Alternative Flows** | Invalid file type → rejected. File too large → rejected. S3 unavailable → error. |
| **Completion Conditions** | File is stored in S3 and metadata is saved in database. |

---

## UC13: Manage External Links

| Field | Description |
|-------|-------------|
| **Short Description** | User adds, edits, or removes external links on a project. |
| **Actors** | Student (own project), Supervisor, Admin |
| **Triggering Conditions** | User interacts with the external links section. |
| **Main Flow** | 1. User provides URL, title, and optional description. 2. System validates URL format. 3. System creates/updates/deletes the external link record. |
| **Alternative Flows** | Invalid URL → validation error. |
| **Completion Conditions** | External link is added/updated/removed. |

---

## UC14: Sign Up for Project

| Field | Description |
|-------|-------------|
| **Short Description** | Student expresses interest in a project by signing up. |
| **Actors** | Student |
| **Triggering Conditions** | Student clicks "Sign Up" on an available project. |
| **Main Flow** | 1. System verifies user is a student. 2. System checks for duplicate signup (unique constraint: project_id + student_id). 3. System creates signup record. |
| **Alternative Flows** | Already signed up → error (duplicate). Non-student tries → 403. |
| **Completion Conditions** | Signup record exists; teacher can see student's interest. |

---

## UC15: Cancel Signup

| Field | Description |
|-------|-------------|
| **Short Description** | Student withdraws their interest from a project. |
| **Actors** | Student |
| **Triggering Conditions** | Student clicks "Cancel Signup" on a project they previously signed up for. |
| **Main Flow** | 1. System verifies the signup exists for this student. 2. System deletes the signup record. |
| **Alternative Flows** | Signup not found → 404. |
| **Completion Conditions** | Signup record is removed. |

---

## UC16: View Project Signups

| Field | Description |
|-------|-------------|
| **Short Description** | Supervisor or admin views which students expressed interest in a project. |
| **Actors** | Supervisor (supervised projects), Admin (any) |
| **Triggering Conditions** | User navigates to signups section of a project. |
| **Main Flow** | 1. System verifies access (admin or supervising teacher). 2. System returns list of students who signed up with timestamps. |
| **Alternative Flows** | No signups → empty list. Student tries to view → 403. |
| **Completion Conditions** | Signup list is displayed. |

---

## UC17: Assign Student to Project

| Field | Description |
|-------|-------------|
| **Short Description** | Teacher or admin assigns a student to a project. |
| **Actors** | Supervisor, Admin |
| **Triggering Conditions** | User selects a student to assign via the project management interface. |
| **Main Flow** | 1. System verifies the student exists and has role `student`. 2. System updates project's `student_id` field. 3. System creates notification for the assigned student. 4. System logs activity. |
| **Alternative Flows** | Student already assigned to another project → warning. Null studentId → removes assignment. |
| **Completion Conditions** | Project's `student_id` is updated; student is notified. |

---

## UC18: Lock Project

| Field | Description |
|-------|-------------|
| **Short Description** | Supervisor or admin locks a project to prevent further edits during evaluation. |
| **Actors** | Supervisor, Admin |
| **Triggering Conditions** | User clicks "Lock" on a draft project. |
| **Main Flow** | 1. System verifies project is in `draft` status. 2. System updates status to `locked`, sets `locked_at`, `locked_by`, and optional `lock_reason`. 3. System logs activity and creates notification for student. |
| **Alternative Flows** | Project already locked → error. Project is public → cannot be locked. |
| **Completion Conditions** | Project status is `locked`; student and assigned teachers are notified. |

---

## UC19: Unlock Project

| Field | Description |
|-------|-------------|
| **Short Description** | Supervisor or admin unlocks a project back to draft for revision. |
| **Actors** | Supervisor, Admin |
| **Triggering Conditions** | User clicks "Unlock" on a locked project. |
| **Main Flow** | 1. System verifies project is in `locked` status. 2. System updates status to `draft`, clears lock fields. 3. System logs activity. |
| **Alternative Flows** | Project is public → cannot be unlocked. Project already draft → no-op. |
| **Completion Conditions** | Project status is `draft`; student can edit again. |

---

## UC20: Submit Grades

| Field | Description |
|-------|-------------|
| **Short Description** | Teacher submits grades for a project using the assigned scale set (blind grading). |
| **Actors** | Supervisor, Opponent |
| **Triggering Conditions** | Teacher opens grading form and submits scores. |
| **Main Flow** | 1. System determines teacher's role (supervisor/opponent) for this project. 2. System loads the appropriate scale set (by year + project_role). 3. Teacher enters a grade value for each scale. 4. Teacher optionally writes a review (posudek). 5. System upserts grade records and creates/updates review. 6. System logs activity and creates notification for student. |
| **Alternative Flows** | No scale set configured for this year/role → error. Teacher not assigned to project → 403. Grade value exceeds scale maxVal → validation error. |
| **Completion Conditions** | Grades are saved per scale; review is saved. Teacher can only see their own grades (blind). |

---

## UC21: View Grades

| Field | Description |
|-------|-------------|
| **Short Description** | User views grades for a project (access depends on role). |
| **Actors** | Student (own project), Supervisor (own grades), Opponent (own grades), Admin (all grades) |
| **Triggering Conditions** | User navigates to the grades tab of a project. |
| **Main Flow** | 1. System checks role and returns appropriate data. 2. Admin sees all grades from all reviewers. 3. Supervisor/Opponent sees only their own grades (blind grading). 4. Student sees all submitted grades. |
| **Alternative Flows** | No grades submitted yet → empty state. |
| **Completion Conditions** | Grade data is displayed according to role-based access. |

---

## UC22: Write Review (Posudek)

| Field | Description |
|-------|-------------|
| **Short Description** | Teacher writes a written evaluation (posudek) for a project. |
| **Actors** | Supervisor, Opponent |
| **Triggering Conditions** | Teacher submits the review form (included in grade submission - UC20). |
| **Main Flow** | 1. Teacher writes evaluation text (comments field). 2. System saves or updates the review record. 3. Review is linked to project and reviewer. |
| **Alternative Flows** | Empty review → optional, grades can be submitted without text. |
| **Completion Conditions** | Review record is saved in database. |

---

## UC23: Publish Project

| Field | Description |
|-------|-------------|
| **Short Description** | Admin publishes a locked project, making it publicly visible. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin clicks "Publish" on a locked project. |
| **Main Flow** | 1. System verifies project is in `locked` status. 2. System updates status to `public`. 3. System logs activity and creates notification for student. |
| **Alternative Flows** | Project is draft → must be locked first. Already public → no-op. |
| **Completion Conditions** | Project is visible at `/public` routes without authentication. |

---

## UC24: Bulk Publish Projects

| Field | Description |
|-------|-------------|
| **Short Description** | Admin publishes multiple locked projects at once. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin selects multiple projects and clicks "Bulk Publish". |
| **Main Flow** | 1. System receives array of project IDs. 2. System updates all matching locked projects to `public` in a transaction. 3. System logs activities and creates notifications for all affected students. 4. System returns count of published projects. |
| **Alternative Flows** | Some projects not locked → skipped. Rate limit (25/15min) exceeded → 429. |
| **Completion Conditions** | All valid projects are published; students are notified. |

---

## UC25: Manage Users (CRUD)

| Field | Description |
|-------|-------------|
| **Short Description** | Admin creates, reads, updates, and deletes user accounts. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin accesses the user management page. |
| **Main Flow** | 1. Admin can list all users with filtering by role. 2. Admin can view individual user profiles. 3. Admin can edit user details (name, email, year, class). 4. Admin can delete users (cascade-deletes their data). |
| **Alternative Flows** | Delete user with active projects → projects remain (supervisor/student fields set to null). |
| **Completion Conditions** | User record is created/updated/deleted. |

---

## UC26: Invite User via Email

| Field | Description |
|-------|-------------|
| **Short Description** | Admin creates a new user account and sends an invitation email with a setup link. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin fills in the invite form (email, role, year). |
| **Main Flow** | 1. System creates user record without password. 2. System generates invitation token with expiry. 3. System sends email with link containing the token. 4. Invited user follows link → triggers UC06. |
| **Alternative Flows** | Email already exists → 409. SMTP failure → error (user still created, can resend). Rate limit (20/hour) → 429. |
| **Completion Conditions** | User record exists; invitation email sent. |

---

## UC27: Reset User Password

| Field | Description |
|-------|-------------|
| **Short Description** | Admin triggers a password reset for a user by sending a reset email. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin clicks "Reset Password" on a user's profile. |
| **Main Flow** | 1. System generates a password reset token with expiry. 2. System saves token to user record. 3. System sends password reset email with link. 4. User clicks link and sets new password. |
| **Alternative Flows** | User has Microsoft-only auth → warning. Email delivery failure → error. |
| **Completion Conditions** | Reset email is sent; user can set a new password via the token link. |

---

## UC28: Change User Role

| Field | Description |
|-------|-------------|
| **Short Description** | Admin changes a user's system role (admin/teacher/student). |
| **Actors** | Admin |
| **Triggering Conditions** | Admin selects a new role for a user. |
| **Main Flow** | 1. System validates the new role is a valid enum value. 2. System updates user's role field. 3. Existing JWT tokens remain valid until expiry (role checked on sensitive operations). |
| **Alternative Flows** | Admin tries to demote themselves → prevented. Rate limit (60/15min) → 429. |
| **Completion Conditions** | User's role is updated in database. |

---

## UC29: Bulk Assign Year

| Field | Description |
|-------|-------------|
| **Short Description** | Admin assigns an academic year to multiple users at once. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin selects users and target year, clicks "Assign Year". |
| **Main Flow** | 1. System receives array of user IDs and target year_id. 2. System updates all matching users' `year_id` in a batch. 3. System returns count of updated users. |
| **Alternative Flows** | Year not found → 404. No users selected → validation error. |
| **Completion Conditions** | All selected users are assigned to the specified academic year. |

---

## UC30: Manage Scales & Scale Sets

| Field | Description |
|-------|-------------|
| **Short Description** | Admin configures grading scales and groups them into scale sets per year/role. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin accesses the scales management page. |
| **Main Flow** | 1. Admin creates scales (name, maxVal, description). 2. Admin creates scale sets (name, year, project_role: supervisor/opponent). 3. Admin assigns scales to sets with weights and display order via `scale_set_scales`. |
| **Alternative Flows** | Scale in use by existing grades → cannot be deleted. |
| **Completion Conditions** | Scales and scale sets are configured for grading. |

---

## UC31: Manage Subjects

| Field | Description |
|-------|-------------|
| **Short Description** | Admin creates, edits, or deactivates course subjects. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin accesses the subjects management page. |
| **Main Flow** | 1. Admin creates subject (unique name, description). 2. Admin can edit or toggle `is_active` flag. |
| **Alternative Flows** | Duplicate name → 409 Conflict. |
| **Completion Conditions** | Subject is created/updated in the catalog. |

---

## UC32: Manage Academic Years

| Field | Description |
|-------|-------------|
| **Short Description** | Admin configures academic years with key dates and reminder settings. |
| **Actors** | Admin |
| **Triggering Conditions** | Admin accesses the years management page. |
| **Main Flow** | 1. Admin creates year (name, assignment_date, submission_date, feedback_date). 2. Admin configures `deadline_reminder_days` (default: [7, 3, 1]). 3. Year is available for project/user/scale_set assignment. |
| **Alternative Flows** | Duplicate year name → error. |
| **Completion Conditions** | Academic year is configured with dates and reminder schedule. |

---

## UC33: View Notifications

| Field | Description |
|-------|-------------|
| **Short Description** | User views their notifications (project assignments, grade submissions, deadline reminders). |
| **Actors** | Student, Teacher, Admin |
| **Triggering Conditions** | User clicks notification icon or navigates to notifications page. |
| **Main Flow** | 1. System fetches user's notifications (unread count from Redis cache). 2. User views list sorted by creation date. 3. User can mark individual notifications as read. |
| **Alternative Flows** | No notifications → empty state. |
| **Completion Conditions** | Notifications are displayed; read status is updated. |

---

## UC34: Edit Profile

| Field | Description |
|-------|-------------|
| **Short Description** | User updates their profile information and avatar. |
| **Actors** | Student, Teacher, Admin |
| **Triggering Conditions** | User navigates to profile settings page. |
| **Main Flow** | 1. User updates name, email, class, year. 2. User optionally uploads avatar (pre-signed S3 URL, key: `avatars/{userId}/{timestamp}-{filename}`). 3. System saves changes. |
| **Alternative Flows** | Email already taken → 409. Invalid avatar type/size → rejected. |
| **Completion Conditions** | User profile is updated. |

---

## UC35: Auto-Lock Expired Projects

| Field | Description |
|-------|-------------|
| **Short Description** | System automatically locks draft projects past the submission deadline. |
| **Actors** | System (Scheduler) |
| **Triggering Conditions** | Scheduled cron job runs, or admin triggers via `POST /api/projects/auto-lock`. |
| **Main Flow** | 1. System queries all draft projects where year's `submission_date` has passed. 2. System locks each project (status → `locked`). 3. System logs activity for each lock. |
| **Alternative Flows** | No expired drafts → no action. |
| **Completion Conditions** | All overdue draft projects are locked. |

---

## UC36: Send Deadline Reminders

| Field | Description |
|-------|-------------|
| **Short Description** | System sends notifications to students as deadlines approach. |
| **Actors** | System (Scheduler / BullMQ Worker) |
| **Triggering Conditions** | Scheduled job checks deadlines against `deadline_reminder_days` config. |
| **Main Flow** | 1. System calculates days remaining until each year's `submission_date`. 2. For each project: if days remaining matches a configured reminder day AND reminder hasn't been sent yet → create notification. 3. System updates project's `reminders_sent` array to prevent duplicates. |
| **Alternative Flows** | Reminder already sent for this day count → skipped. Project already locked → skipped. |
| **Completion Conditions** | Relevant students receive deadline reminder notifications. |
