# Build stage
FROM node:latest AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files from root
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY packages/shared-types/package.json ./packages/shared-types/
# Backend package.json needed so pnpm can install prisma + zod-prisma-types
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy shared-types source
COPY packages/shared-types/ ./packages/shared-types/

# Copy Prisma schema and generate Zod types into shared-types
COPY backend/prisma/ ./backend/prisma/
RUN cd /app/backend && npx prisma generate

# Copy frontend source code
COPY frontend/ ./frontend/

# Move to frontend for build
WORKDIR /app/frontend

# Build the Next.js application (uses standalone output)
RUN pnpm build

# Production stage
FROM node:latest AS runner

WORKDIR /app

ENV NODE_ENV=production

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone server and static assets from builder
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

USER nextjs

EXPOSE 3000

# Start the standalone Next.js server
CMD ["node", "frontend/server.js"]
