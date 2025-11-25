# Database Migration Strategy - Role-Based Access Control

## Overview

This document describes the complete migration strategy for implementing role-based access control (RBAC) in the thesis management system. The migration creates a `public.users` table that extends `auth.users` with application-specific role information.

## Database Schema Analysis

### Before Migration

**Existing Structure:**
- **Enum `user_roles`**: Contains `admin`, `teacher`, `student`
- **Table `roles`**: Empty table (id, name, description, created_at, updated_at) - **redundant and not used**
- **UUID columns WITHOUT foreign key constraints** referencing `auth.users`:
  - `projects.supervisor_id`
  - `projects.opponent_id`
  - `grades.reviewer_id`
  - `reviews.reviewer_id`
  - `project_students.student_id`

### After Migration

**New Structure:**
- **Table `public.users`**: Primary table for user profiles with role assignment
  - `id UUID PRIMARY KEY` - references `auth.users(id)`
  - `role user_roles NOT NULL` - single role from enum (admin, teacher, student)
  - `full_name VARCHAR` - display name
  - `created_at`, `updated_at` - timestamps
- **Foreign Key Constraints**: All UUID columns now properly reference `public.users(id)`
- **Helper Functions**: Role checking and management functions
- **Views**: Convenient access to user data by role

## Migration Files Applied

### 1. `20251101232720_create_public_users_with_roles.sql`

**Purpose**: Create the core `public.users` table with role-based access control

**What it does:**
- Creates `public.users` table with `user_roles` enum column
- Adds indexes for performance (`idx_users_role`)
- Sets up automatic `updated_at` timestamp trigger
- Enables Row Level Security (RLS)
- Creates RLS policies:
  - Users can view their own profile
  - Admins can view/insert/update all users
  - Users can update their own profile (but not their role)
- Creates automatic sync trigger: When new user signs up in `auth.users`, automatically creates corresponding `public.users` record with default 'student' role

**Key Features:**
```sql
-- Each user has exactly one role
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_roles NOT NULL,
    full_name VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-sync new auth users to public.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 2. `20251101233018_migrate_existing_users_and_add_fk_constraints.sql`

**Purpose**: Migrate existing users and enforce referential integrity

**What it does:**
- Populates `public.users` with existing `auth.users` data (2 users migrated)
- Adds foreign key constraints to all tables:
  - `projects.supervisor_id` → `public.users(id)` (ON DELETE RESTRICT)
  - `projects.opponent_id` → `public.users(id)` (ON DELETE RESTRICT)
  - `grades.reviewer_id` → `public.users(id)` (ON DELETE RESTRICT)
  - `reviews.reviewer_id` → `public.users(id)` (ON DELETE CASCADE)
  - `project_students.student_id` → `public.users(id)` (ON DELETE CASCADE)
- Creates indexes on all foreign key columns for query performance
- Adds documentation comments to constraints

**Why DELETE RESTRICT vs CASCADE:**
- **RESTRICT**: Used for supervisor/opponent/reviewer in projects/grades - prevents accidentally deleting users who have important academic records
- **CASCADE**: Used for reviews and project_students - these can be safely deleted if user is removed

### 3. `20251101234535_add_role_helper_functions_and_views.sql`

**Purpose**: Provide utility functions and views for role-based operations

**What it does:**

**Helper Functions:**
```sql
-- Get role of any user (defaults to current user)
public.get_user_role(user_id UUID) → user_roles

-- Check if current user has specific role
public.has_role(required_role user_roles) → BOOLEAN

-- Convenience functions
public.is_admin() → BOOLEAN
public.is_teacher() → BOOLEAN

-- Safely update user role (admin only)
public.update_user_role(target_user_id UUID, new_role user_roles) → BOOLEAN
```

**Views:**
```sql
-- Combined user profile with auth data
public.user_profiles
  - Joins public.users + auth.users
  - Shows: id, role, full_name, email, timestamps

-- All teachers (teacher + admin roles)
public.teachers
  - Users who can supervise/review

-- All students
public.students
  - Users with student role
```

## Data Integrity Features

### 1. Referential Integrity
All user references now have proper foreign key constraints. You **cannot**:
- Insert a project with non-existent supervisor_id
- Assign a grade with invalid reviewer_id
- Delete a user who has active projects/grades (RESTRICT)

### 2. Role Assignment
- Each user has **exactly one role** from the `user_roles` enum
- Roles are type-safe at the database level
- New users automatically get 'student' role
- Only admins can change user roles (via `update_user_role()`)

### 3. Row Level Security (RLS)
All queries automatically filtered by RLS policies:
- Users can only see their own data (unless admin)
- Admins can see and modify all users
- Users cannot change their own role

## Current State

### Users in System
```
ID: f4c0f416-26e9-4db3-bf04-189610a35027
Email: krogdeveloper@gmail.com
Role: student
Last Sign In: 2025-11-01 15:34:28

ID: c0d97268-4efa-4a90-b35a-17f1d88caac3
Email: testacc@gmail.com
Role: student
Last Sign In: (never)
```

### Foreign Key Constraints Active

**All User References (5 constraints):**
- ✅ `fk_projects_supervisor` on projects.supervisor_id → public.users(id) [DELETE RESTRICT]
- ✅ `fk_projects_opponent` on projects.opponent_id → public.users(id) [DELETE RESTRICT]
- ✅ `fk_grades_reviewer` on grades.reviewer_id → public.users(id) [DELETE RESTRICT]
- ✅ `fk_reviews_reviewer` on reviews.reviewer_id → public.users(id) [DELETE CASCADE]
- ✅ `fk_project_students_student` on project_students.student_id → public.users(id) [DELETE CASCADE]

**Note**: The only remaining reference to `auth.users` is `public.users.id` itself (CASCADE delete), which is intentional - it keeps the two tables synchronized.

## How to Use in Application

### 1. Check User Role
```typescript
// In your API or React Server Component
const { data } = await supabase.rpc('get_user_role');
console.log(data); // 'admin' | 'teacher' | 'student'
```

### 2. Role-Based Queries
```typescript
// Get all teachers (for supervisor dropdown)
const { data: teachers } = await supabase
  .from('teachers')
  .select('*');

// Get all students
const { data: students } = await supabase
  .from('students')
  .select('*');

// Get full user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### 3. Update User Role (Admin Only)
```typescript
// Only works if current user is admin
const { data, error } = await supabase.rpc('update_user_role', {
  target_user_id: 'uuid-here',
  new_role: 'teacher'
});
```

### 4. Permission Checks in Components
```typescript
// Check if current user is admin
const { data: isAdmin } = await supabase.rpc('is_admin');

if (isAdmin) {
  // Show admin UI
}

// Check specific role
const { data: hasRole } = await supabase.rpc('has_role', {
  required_role: 'teacher'
});
```

## Next Steps for Frontend Implementation

### 1. Update API Type Generation
```bash
cd frontend
npm run generate-types
```

This will regenerate TypeScript types including:
- `Database['public']['Tables']['users']`
- `Database['public']['Views']['user_profiles']`
- `Database['public']['Functions']['get_user_role']`

### 2. Create Role-Based Routing Middleware

Based on our earlier discussion, you can now implement:

**Option A: Route Groups** (Recommended)
```
app/
  [locale]/
    (admin)/
      projects/page.tsx    # Admin view
      users/page.tsx       # Admin view
    (teacher)/
      projects/page.tsx    # Teacher view
    (student)/
      projects/page.tsx    # Student view
```

**Middleware** (`src/middleware.ts`):
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Get user role
  const { data: role } = await supabase.rpc('get_user_role')

  // Redirect based on role and current path
  const path = req.nextUrl.pathname

  if (path.includes('/(admin)') && role !== 'admin') {
    return NextResponse.redirect(new URL(`/${locale}/(${role})/dashboard`, req.url))
  }

  if (path.includes('/(teacher)') && role !== 'teacher') {
    return NextResponse.redirect(new URL(`/${locale}/(${role})/dashboard`, req.url))
  }

  if (path.includes('/(student)') && role !== 'student') {
    return NextResponse.redirect(new URL(`/${locale}/(${role})/dashboard`, req.url))
  }

  return res
}
```

### 3. Create Role Context Provider
```typescript
// src/contexts/RoleContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';

type UserRole = 'admin' | 'teacher' | 'student';

const RoleContext = createContext<{
  role: UserRole | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}>({
  role: null,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchRole() {
      const { data } = await supabase.rpc('get_user_role');
      setRole(data);
    }
    fetchRole();
  }, [supabase]);

  return (
    <RoleContext.Provider value={{
      role,
      isAdmin: role === 'admin',
      isTeacher: role === 'teacher',
      isStudent: role === 'student',
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
```

### 4. Update Login Redirect Logic
```typescript
// After successful login
const { data: role } = await supabase.rpc('get_user_role');
router.push(`/${locale}/(${role})/dashboard`);
```

## Important Notes

### About the `roles` Table
The existing `public.roles` table is **not used** in this implementation. We use the `user_roles` enum directly because:
- **Type Safety**: Enum provides compile-time type checking
- **Simplicity**: No joins needed to check roles
- **Performance**: Direct column comparison is faster than joins
- **Atomic**: Each user has exactly one role

If you need role metadata (descriptions, permissions, etc.) in the future, you can:
1. Keep the enum for the `public.users.role` column
2. Use the `roles` table for additional metadata
3. Add a constraint: `CHECK (role::text = name)`

### Security Considerations

1. **RLS is Enabled**: All queries automatically filtered by user context
2. **Admin-Only Operations**: Role updates require admin privileges
3. **Prevent Self-Demotion**: Consider adding check to prevent admins from removing their own admin role
4. **Audit Trail**: Consider adding audit table for role changes

### Migration Rollback

If you need to rollback, run in reverse order:
```sql
-- 1. Drop helper functions and views
DROP VIEW IF EXISTS public.students;
DROP VIEW IF EXISTS public.teachers;
DROP VIEW IF EXISTS public.user_profiles;
DROP FUNCTION IF EXISTS public.update_user_role;
DROP FUNCTION IF EXISTS public.is_teacher;
DROP FUNCTION IF EXISTS public.is_admin;
DROP FUNCTION IF EXISTS public.has_role;
DROP FUNCTION IF EXISTS public.get_user_role;

-- 2. Remove foreign key constraints
ALTER TABLE public.project_students DROP CONSTRAINT IF EXISTS fk_project_students_student;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS fk_reviews_reviewer;
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS fk_grades_reviewer;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS fk_projects_opponent;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS fk_projects_supervisor;

-- 3. Drop users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.users;
```

## Testing Checklist

- [x] Users table created with role enum column
- [x] Existing users migrated (2 users)
- [x] Foreign key constraints added (5 constraints)
- [x] Helper functions working (`get_user_role`, `is_admin`, etc.)
- [x] Views accessible (`user_profiles`, `teachers`, `students`)
- [x] RLS policies active
- [x] Auto-sync trigger for new users
- [ ] Frontend middleware for role-based routing
- [ ] Frontend role context provider
- [ ] Login redirect based on role
- [ ] Admin UI for role management
- [ ] Test role updates
- [ ] Test RLS policies from different user contexts

## Questions?

- **Why not many-to-many roles?** The use case diagram shows each user has one primary role. Teachers can also be supervisors/opponents, but those are project-specific relationships, not separate roles.
- **Why RESTRICT on some deletes?** Academic integrity - we don't want to accidentally delete users and lose the record of who supervised/graded projects.
- **Can teachers also be students?** No, not in this design. If needed, you'd need to switch to a many-to-many user_roles junction table.
