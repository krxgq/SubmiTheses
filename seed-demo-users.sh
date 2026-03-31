#!/bin/bash
# Creates demo teacher and student accounts in the SubmiTheses database.
# Run after `docker compose up -d` from the project root directory.

set -e

echo "=== SubmiTheses — vytvoření demo účtů ==="
echo ""

# Hash passwords using the running backend container
TEACHER_HASH=$(docker exec -e PASS="TeacherProd123" submitheses-backend \
  node -e "const b=require('bcrypt');b.hash(process.env.PASS,10).then(h=>process.stdout.write(h))")

STUDENT_HASH=$(docker exec -e PASS="StudentProd123" submitheses-backend \
  node -e "const b=require('bcrypt');b.hash(process.env.PASS,10).then(h=>process.stdout.write(h))")

TEACHER_UUID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)
STUDENT_UUID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)

# Insert teacher account
docker exec submitheses-postgres psql -U postgres -d submitheses -c \
  "INSERT INTO public.users (id, role, first_name, last_name, email, password_hash, auth_provider, email_verified, created_at, updated_at)
   VALUES ('$TEACHER_UUID', 'teacher', 'Demo', 'Teacher', 'teacher@submitheses.app', '$TEACHER_HASH', 'local', true, NOW(), NOW())
   ON CONFLICT (email) DO NOTHING;"

# Insert student account
docker exec submitheses-postgres psql -U postgres -d submitheses -c \
  "INSERT INTO public.users (id, role, first_name, last_name, email, password_hash, auth_provider, email_verified, created_at, updated_at)
   VALUES ('$STUDENT_UUID', 'student', 'Demo', 'Student', 'student@submitheses.app', '$STUDENT_HASH', 'local', true, NOW(), NOW())
   ON CONFLICT (email) DO NOTHING;"

echo "Hotovo."
echo "  teacher@submitheses.app / TeacherProd123"
echo "  student@submitheses.app / StudentProd123"
