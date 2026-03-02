# Build stage
FROM node:latest AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files from root
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy shared-types source
COPY packages/shared-types/ ./packages/shared-types/

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

# Copy standalone server and static assets from builder
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000

# Start the standalone Next.js server
CMD ["node", "frontend/server.js"]
