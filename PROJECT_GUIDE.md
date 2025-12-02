# SumbiTheses - Thesis Management System

A comprehensive web-based platform for managing graduation theses and projects in educational institutions.

## Overview

SumbiTheses enables schools to digitally manage the complete thesis lifecycle—from assignment and writing to review, grading, and publication. The system supports multiple user roles (students, supervisors, opponents, administrators) with fine-grained access control.

## Key Features

- 📝 **Project Management**: Create, assign, and track thesis projects
- 👥 **Role-Based Access**: Distinct interfaces for students, teachers, and administrators
- 📎 **Document Handling**: Upload and manage thesis documents and attachments
- ⭐ **Review System**: Supervisors and opponents can submit reviews and grades
- 🔒 **Locking Mechanism**: Automatic and manual project locking after deadlines
- 🌐 **Public Gallery**: Showcase selected excellent projects publicly
- 🌍 **Internationalization**: Full support for Czech and English languages
- 🔐 **Security**: Row-level security with JWT-based authentication

## Architecture

This is a **monorepo** with a clear separation between frontend, backend, and shared code:

```
SumbiTheses/
├── backend/              # Express.js API server
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── controllers/ # HTTP request handlers
│   │   ├── services/    # Business logic layer
│   │   ├── routes/      # API route definitions
│   │   ├── middleware/  # Auth, validation, error handling
│   │   └── types/       # Backend-specific types
│   └── openapi.yaml     # Auto-generated API documentation
│
├── frontend/            # Next.js 15 application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Client utilities (auth, API client, i18n)
│   │   └── locales/    # Translation files (en, cz)
│   └── middleware.ts   # Auth & route protection
│
├── packages/
│   └── shared-types/   # Shared TypeScript types (API contract)
│
└── docs/               # Project documentation
```

## Technology Stack

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js + TypeScript | Server execution |
| **Framework** | Express.js | HTTP API server |
| **Database** | PostgreSQL (Supabase) | Data persistence |
| **ORM** | Prisma | Type-safe database access |
| **Authentication** | Supabase Auth | User authentication & JWT |
| **Validation** | Zod | Request validation schemas |
| **API Docs** | OpenAPI 3.1 | Auto-generated documentation |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | React meta-framework |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Flowbite React | Component library |
| **Icons** | Lucide React | Icon library |
| **i18n** | next-intl | Internationalization (CZ/EN) |
| **API Client** | Custom (OpenAPI-generated) | Type-safe API calls |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | Supabase | PostgreSQL + Auth + Storage |
| **Row-Level Security** | PostgreSQL RLS | Fine-grained access control |
| **File Storage** | Supabase Storage | Document and attachment storage |

## Database Schema

### Core Tables

**Users & Authentication**
- `public.users` - Application user profiles (synced with `auth.users`)
- Role-based access: `admin`, `teacher`, `student`

**Projects & Assignments**
- `projects` - Thesis project records
- `project_descriptions` - Structured project details (topic, goals, specifications, schedule)
- `years` - Academic year configurations with deadlines

**Reviews & Grading**
- `reviews` - Feedback from supervisors and opponents
- `grades` - Numerical grades with scale references
- `scales` - Grading scale definitions (customizable per year/role)
- `scale_sets` - Collections of scales for supervisors vs opponents

**Resources**
- `attachments` - File attachments linked to projects
- `external_links` - External resource URLs

### Security Model

All tables use **PostgreSQL Row Level Security (RLS)**:
- Students can view/edit only their assigned projects
- Teachers can manage projects they supervise or oppose
- Admins have full system access
- Public projects are accessible without authentication

## API Structure

The backend exposes a RESTful API with the following endpoint groups:

```
/api
├── /users              # User management
├── /projects           # Project CRUD operations
├── /projects/:id/descriptions  # Structured project details
├── /attachments        # File upload/download
├── /external-links     # External resource management
├── /reviews            # Review submission
├── /grades             # Grading operations
├── /scales             # Grading scale management
├── /years              # Academic year configuration
└── /roles              # Role management
```

**Authentication**: All endpoints (except public projects) require JWT authentication via Supabase Auth.

## Type System

The project uses a **three-layer type system**:

### 1. Database Layer (Prisma)
- **Location**: `backend/prisma/schema.prisma`
- **Purpose**: Source of truth for database structure
- **Generated**: Prisma Client types (internal use only)

### 2. Shared Types Layer ⭐ (API Contract)
- **Location**: `packages/shared-types/`
- **Purpose**: Contract between frontend and backend
- **Usage**: Both frontend and backend import from `@sumbi/shared-types`
- **Files**:
  - `user.ts` - User, role types
  - `project.ts` - Project, description, request types
  - `index.ts` - Centralized exports

### 3. OpenAPI Documentation Layer
- **Location**: `backend/openapi.yaml`
- **Purpose**: Auto-generated API documentation
- **Generated**: TypeScript types for documentation tools

This separation ensures:
- ✅ Type-safe communication between frontend and backend
- ✅ Database implementation details don't leak to API
- ✅ Easy to change database without breaking contracts
- ✅ Single source of truth for API types

## Project Workflows

### Student Workflow
1. View assigned thesis project
2. Upload thesis document (PDF + secondary format)
3. Add attachments and external links
4. Submit project when ready
5. View reviews and grades after deadline

### Teacher Workflow (Supervisor/Opponent)
1. View assigned projects (as supervisor or opponent)
2. Review submitted theses
3. Submit review comments
4. Provide grades using assigned scales
5. Mark projects for public showcase (if exceptional)

### Administrator Workflow
1. Manage academic years and deadlines
2. Create and assign projects to students
3. Assign supervisors and opponents
4. Configure grading scales per year/role
5. Lock/unlock projects manually
6. View statistics and reports

## Internationalization (i18n)

The system supports **Czech** and **English** with:
- Translation files: `frontend/src/locales/{en,cz}/common.json`
- URL-based locale: `/{locale}/...` (e.g., `/en/projects`, `/cz/projects`)
- Server and client component support
- Automatic locale detection and persistence

## Authentication Flow

1. **Login**: User authenticates via Supabase Auth (email/password)
2. **JWT Token**: Supabase returns JWT access token
3. **Role Extraction**: Backend extracts role from JWT `app_metadata.role`
4. **Middleware**: Next.js middleware validates session on every request
5. **RLS**: Database enforces row-level security based on user ID and role
6. **Token Refresh**: Stale tokens (>30 min) are automatically refreshed

## Database Migrations

The project uses **Supabase migrations** (stored in `backend/prisma/migrations/`) to track schema changes:

- Each migration is timestamped and named
- Migrations are applied in order
- Includes forward changes (SQL to apply)
- Provides version control for database schema
- Enables reproducible deployments across environments

**Recent migrations**:
- `add_jwt_claims_sync` - Sync roles to JWT tokens
- `add_structured_project_description` - Add structured description fields
- `replace_jsonb_with_project_descriptions_table` - Normalize description structure

## Environment Configuration

### Backend (`.env`)
```bash
DATABASE_URL=          # Supabase PostgreSQL connection
DIRECT_URL=            # Direct connection (for migrations)
SUPABASE_URL=          # Supabase project URL
SUPABASE_ANON_KEY=     # Public anonymous key
SUPABASE_SERVICE_KEY=  # Service role key (backend only)
PORT=3001              # API server port
NODE_ENV=development   # Environment mode
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Public anonymous key
NEXT_PUBLIC_API_URL=           # Backend API URL (http://localhost:3001)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (or Supabase account)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/SumbiTheses.git
   cd SumbiTheses
   ```

2. **Install dependencies**:
   ```bash
   # Install all workspaces
   npm install

   # Or for each package:
   cd backend && npm install
   cd ../frontend && npm install
   cd ../packages/shared-types && npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env` in backend/
   - Copy `.env.local.example` to `.env.local` in frontend/
   - Fill in Supabase credentials

4. **Setup database**:
   ```bash
   cd backend
   npx prisma generate          # Generate Prisma Client
   npx prisma migrate deploy    # Apply migrations
   ```

5. **Build shared types**:
   ```bash
   cd packages/shared-types
   npm run build
   ```

6. **Run development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

7. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api-docs (if configured)

## Project Status

This is an active development project for managing graduation theses. Current status:

✅ **Completed**:
- User authentication and role-based access
- Project CRUD operations
- Review and grading system
- File attachment management
- Internationalization (CZ/EN)
- Structured project descriptions
- Row-level security policies

🚧 **In Progress**:
- Public project showcase
- Advanced reporting and statistics
- Email notifications
- Project templates

## Contributing

This is an educational project. Contributions, suggestions, and feedback are welcome!

