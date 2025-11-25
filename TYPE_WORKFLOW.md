# Type Management Workflow

This project uses **auto-generated type definitions** in `@sumbi/shared-types` for the API contract layer.

## Why Automated Types?

- **Single Source of Truth**: Database schema drives all type definitions
- **Always in Sync**: Types automatically match your Prisma schema
- **Type Safety**: TypeScript ensures frontend and backend stay in sync
- **Zero Maintenance**: No manual type updates needed

## When Database Schema Changes

1. **Update Prisma Schema** (`backend/prisma/schema.prisma`)
   ```bash
   # Apply migration via Supabase MCP or prisma migrate
   ```

2. **Regenerate All Types**
   ```bash
   cd backend
   pnpm run generate:all
   # This runs:
   # 1. npx prisma generate (Prisma Client)
   # 2. npx tsx scripts/generate-types.ts (Shared Types)
   ```

3. **Update Backend Services** (if needed)
   - Modify service methods to handle new fields
   - Use Prisma types internally, return shared types to controllers

## Example Flow

```
Database Change → Prisma Schema → Auto-generate Prisma Client + Shared Types → Update Services (if needed)
```

## Type Layers

```
┌─────────────────────────────────────┐
│  Prisma Schema (schema.prisma)      │  ← Single source of truth
└─────────────────────────────────────┘
              ↓
        [generate:all]
              ↓
    ┌─────────┴─────────┐
    ↓                    ↓
┌─────────────┐  ┌──────────────────┐
│ Prisma      │  │ Shared Types     │
│ Client      │  │ @sumbi/shared    │
│ (backend)   │  │ (frontend+back)  │
└─────────────┘  └──────────────────┘
```

## Scripts Available

- `pnpm run generate` - Generate Prisma Client only
- `pnpm run generate:types` - Generate shared types only
- `pnpm run generate:all` - Generate both (recommended)

## Customizing Generated Types

Edit `backend/scripts/generate-types.ts` to customize:
- Which models to export
- Field transformations
- Additional helper types
- Type aliases and unions

## Benefits

- **Fully Automated**: Change schema → Run one command → All types updated
- **Single source of truth**: Database schema drives everything
- **Type safety**: TypeScript catches mismatches at compile time
- **DRY principle**: Never write the same type twice
