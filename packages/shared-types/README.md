# Shared Types Package

This package contains all shared TypeScript types and Zod schemas for the SumbiTheses application.

## Overview

The shared-types package serves as a **single source of truth** for type definitions used across both frontend and backend applications.

## Structure

```
src/
├── generated/              # Auto-generated Zod schemas from Prisma (DO NOT EDIT)
│   ├── modelSchema/       # Zod schemas for each Prisma model
│   ├── inputTypeSchemas/  # Zod schemas for Create, Update, Where, etc.
│   └── outputTypeSchemas/ # Zod schemas for query results
├── attachments.ts         # Attachment types & API request/response types
├── auth.ts                # Authentication types
├── external-links.ts      # External link types
├── grades.ts              # Grade types
├── project.ts             # Project types (existing)
├── reviews.ts             # Review types
├── scale-sets.ts          # Scale set types
├── scales.ts              # Scale types
├── subjects.ts            # Subject types
├── user.ts                # User types (existing)
├── years.ts               # Year types
└── index.ts               # Barrel export file
```

## Usage

### In Backend Services

```typescript
import type {
  CreateSubjectRequest,
  UpdateSubjectRequest,
  Subject
} from '@sumbi/shared-types';

// Use in service methods
static async createSubject(data: CreateSubjectRequest) {
  return prisma.subjects.create({ data });
}
```

### In Backend Validation (Zod Schemas)

The backend currently has manual Zod schemas in `backend/src/validation/schemas.ts`. You can optionally migrate to use the auto-generated schemas:

```typescript
import { subjectsCreateInputSchema } from '@sumbi/shared-types';

// Use generated Zod schema for validation
export const createSubjectSchema = z.object({
  body: subjectsCreateInputSchema.pick({
    name: true,
    description: true
  })
});
```

### In Frontend

```typescript
import type {
  Project,
  CreateProjectRequest,
  User
} from '@sumbi/shared-types';

// Use for component props, state, API calls
const createProject = async (data: CreateProjectRequest) => {
  // API call
};
```

## Type Generation

Types are automatically generated from the Prisma schema using `zod-prisma-types`.

### Generate Types

```bash
# From backend directory
pnpm generate

# Or from root
cd backend && pnpm exec prisma generate
```

This will:
1. Generate Prisma Client types
2. Generate Zod schemas in `packages/shared-types/src/generated/`

### What Gets Generated

- **Model Schemas**: Basic Zod schema for each Prisma model (e.g., `subjectsSchema`)
- **Input Schemas**: Schemas for create, update, where conditions, etc.
- **Output Schemas**: Schemas for select, include, and query results
- **TypeScript Types**: Inferred types from Zod schemas

## Available Types

### Entities (Prisma Models)
- `Subject` - subjects table
- `Review` - reviews table
- `Grade` - grades table
- `Scale` - scales table
- `ScaleSet` - scale_sets table
- `ScaleSetScale` - scale_set_scales (junction table)
- `Year` - years table
- `Attachment` - attachments table
- `ExternalLink` - external_links table
- `Project` - projects table (existing)
- `ProjectDescription` - project_descriptions table
- `User` (public_users) - users table (existing)

### API Request Types
All entities have corresponding `Create*Request` and `Update*Request` types:
- `CreateSubjectRequest`, `UpdateSubjectRequest`
- `CreateReviewRequest`, `UpdateReviewRequest`
- `CreateGradeRequest`, `UpdateGradeRequest`
- `CreateScaleRequest`, `UpdateScaleRequest`
- `CreateScaleSetRequest`, `UpdateScaleSetRequest`
- `CreateYearRequest`, `UpdateYearRequest`
- `CreateAttachmentRequest`, `UpdateAttachmentRequest`
- `CreateExternalLinkRequest`, `UpdateExternalLinkRequest`
- And more...

### Enums
- `UserRole` - 'admin' | 'teacher' | 'student'
- `ProjectRole` - 'supervisor' | 'opponent'

## Benefits

✅ **Single Source of Truth**: Database schema → Types → Both frontend & backend
✅ **Type Safety**: Compile-time type checking across the entire stack
✅ **Auto-Sync**: Changes to Prisma schema automatically generate new types
✅ **Validation**: Generated Zod schemas for runtime validation
✅ **DRY**: No duplicate type definitions
✅ **Developer Experience**: Autocomplete and type hints in IDEs

## Development Workflow

1. **Update Prisma Schema** (`backend/prisma/schema.prisma`)
2. **Run Migration** (`pnpm exec prisma migrate dev`)
3. **Generate Types** (`pnpm generate`) - This updates shared-types automatically
4. **Use Types** in both frontend and backend code

## Notes

- The `generated/` directory is auto-generated - **DO NOT EDIT** these files manually
- Custom API request/response types are manually maintained in individual type files
- Re-run `pnpm generate` after any Prisma schema changes
