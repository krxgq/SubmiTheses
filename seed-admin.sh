#!/bin/bash
# Creates an admin account in the SubmiTheses database.
# Run after `docker compose up -d` from the project root directory.

set -e

echo "=== SubmiTheses — vytvoření admin účtu ==="
echo ""

# Import schema if the users table doesn't exist yet
TABLE_EXISTS=$(docker exec submitheses-postgres psql -U postgres -d submitheses -tAc \
  "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Schéma databáze nenalezeno — importuji schema.sql..."
  docker exec -i submitheses-postgres psql -U postgres -d submitheses < schema.sql
  echo "Schéma importováno."
  echo ""
fi

read -p "E-mail: " EMAIL
if [[ ! "$EMAIL" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; then
  echo "Chyba: neplatný formát e-mailu."
  exit 1
fi
read -p "Jméno: " FIRST_NAME
read -p "Příjmení: " LAST_NAME
read -s -p "Heslo: " PASSWORD
echo ""

# Hash password using bcrypt inside the running backend container
HASH=$(docker exec -e PASS="$PASSWORD" submitheses-backend \
  node -e "const b=require('bcrypt');b.hash(process.env.PASS,10).then(h=>process.stdout.write(h))")

# Generate a random UUID
UUID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)

# Insert admin user into the database
docker exec submitheses-postgres psql -U postgres -d submitheses -c \
  "INSERT INTO public.users (id, role, first_name, last_name, email, password_hash, auth_provider, email_verified, created_at, updated_at)
   VALUES ('$UUID', 'admin', '$FIRST_NAME', '$LAST_NAME', '$EMAIL', '$HASH', 'local', true, NOW(), NOW())
   ON CONFLICT (email) DO NOTHING;"

echo ""
echo "Hotovo. Přihlaste se na http://localhost:3000 s e-mailem: $EMAIL"
