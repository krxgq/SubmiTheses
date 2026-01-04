# 🐳 Docker Setup Guide

## Quick Start

1. **Start everything:**
   ```bash
   docker-compose up -d
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop everything:**
   ```bash
   docker-compose down
   ```

## Services

| Service | URL | Container Name |
|---------|-----|----------------|
| Backend API | http://localhost:5000 | submitheses-backend |
| Redis | localhost:6379 | submitheses-redis |

## Useful Commands

### View backend logs:
```bash
docker-compose logs -f backend
```

### Restart backend:
```bash
docker-compose restart backend
```

### Rebuild backend:
```bash
docker-compose up -d --build backend
```

### Access Redis CLI:
```bash
docker exec -it submitheses-redis redis-cli
```

### Check Redis cache:
```bash
docker exec -it submitheses-redis redis-cli KEYS "*"
```

### Clear cache:
```bash
docker exec -it submitheses-redis redis-cli FLUSHDB
```

### Check health:
```bash
curl http://localhost:5000/health
```

## Development Workflow

### Option 1: Run backend in Docker (recommended for production-like environment)
```bash
docker-compose up -d
```

### Option 2: Run backend locally with Redis in Docker (hot reload)
```bash
# Start Redis only
docker-compose up -d redis

# Run backend locally
cd backend
npm run dev
```

## Environment Variables

Copy `.env.docker.example` to `.env` and update values:

```bash
cp .env.docker.example .env
nano .env
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Check if ports are in use
lsof -i :5000
lsof -i :6379

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Redis connection issues
```bash
# Check Redis status
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Production Deployment

1. Update `docker-compose.yml`:
   - Set proper `CORS_ORIGIN`
   - Use secrets for sensitive data
   - Remove dev volume mounts
   - Configure restart policies

2. Use docker-compose override:
   ```bash
   # Create docker-compose.prod.yml
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. Set up reverse proxy (nginx/traefik)

4. Configure SSL/TLS

5. Set up monitoring and logging
