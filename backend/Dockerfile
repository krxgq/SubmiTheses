# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files from root
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy shared-types source
COPY packages/shared-types/ ./packages/shared-types/

# Copy backend source code
COPY backend/ ./backend/

# Move to backend for build commands
WORKDIR /app/backend

# Generate Prisma client
RUN pnpm generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files from root
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy shared-types source (needed for workspace dependency)
COPY packages/shared-types/ ./packages/shared-types/

# Copy Prisma schema (needed at runtime for migrations)
COPY backend/prisma ./backend/prisma

# Copy generated Prisma Client from builder (with correct pnpm structure)
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

# Copy Zod types from builder (generated during build stage)
COPY --from=builder /app/packages/shared-types/src/generated ./packages/shared-types/src/generated

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser

# Move to backend directory
WORKDIR /app/backend

# Copy built application from builder
COPY --from=builder /app/backend/dist ./dist

USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
