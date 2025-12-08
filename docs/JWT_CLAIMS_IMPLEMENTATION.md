# JWT Claims Synchronization Implementation

This implementation ensures user roles from `public.users` are automatically included in JWT tokens, eliminating the need for database queries on every request.

## How It Works

### 1. Database Trigger (`update_user_jwt_claims`)
- **Trigger**: Runs on `INSERT` or `UPDATE` of `role` column in `public.users`
- **Function**: Updates `auth.users.raw_app_meta_data` with the role from `public.users`
- **Result**: JWT tokens issued after role changes automatically contain the role

### 2. Frontend Changes
- **middleware.ts**: Reads role directly from JWT token (no DB query)
- **auth.ts**: Gets role from JWT session instead of database fetch
- **Performance**: Zero additional database calls for role access

### 3. Backend Changes  
- **auth.ts**: Updated to prioritize `app_metadata.role` (set by trigger)
- **Compatibility**: Still falls back to `user_metadata.role` and 'student' default

## Usage

### Accessing Role in Frontend
```typescript
// In middleware or server components
const session = await supabase.auth.getSession();
const payload = JSON.parse(atob(session.data.session.access_token.split('.')[1]));
const role = payload.app_metadata?.role || 'student';
```

### Accessing Role in Backend
```typescript
// Already implemented in auth middleware
const role = decoded.app_metadata?.role || decoded.user_metadata?.role || 'student';
```

## Migration Required

Run the migration to set up the trigger:
```bash
cd backend
npx prisma db push
# Or apply the SQL directly to your Supabase database
```

## Benefits

1. **Performance**: No database queries for role access
2. **Consistency**: Role is always available in JWT across frontend/backend
3. **Real-time**: Role changes immediately reflect in new JWT tokens
4. **Security**: Uses Supabase's built-in JWT system

## Testing

1. Login → Role should be in JWT `app_metadata.role`
2. Change role in `public.users` → New JWT should have updated role
3. Middleware should access role without DB calls

## Rollback

If needed, remove the trigger and function:
```sql
DROP TRIGGER IF EXISTS sync_jwt_claims_on_role_change ON public.users;
DROP FUNCTION IF EXISTS update_user_jwt_claims();
```