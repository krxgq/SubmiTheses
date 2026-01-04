# SumbiTheses Docker Setup

This project uses Docker Compose to run the backend and Redis in containers.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.docker.example .env
   # Edit .env with your actual values
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f redis
   docker-compose logs -f mailpit
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

## Services

- **Backend API**: http://localhost:5000
- **PostgreSQL Database**: localhost:5432
- **Redis Cache**: localhost:6379
- **Mailpit (Email Testing)**: http://localhost:8025 (Web UI), localhost:1025 (SMTP)

## Development

### Rebuild after code changes:
```bash
docker-compose up -d --build backend
```

### Run backend in development mode (with hot reload):
```bash
cd backend
npm run dev
```

### Access Redis CLI:
```bash
docker exec -it submitheses-redis redis-cli
```

### View cache statistics:
```bash
docker exec -it submitheses-redis redis-cli INFO stats
```

## Email Testing with Mailpit

Mailpit is a development SMTP server that captures all outgoing emails and displays them in a web interface.

### Access the Mailpit Web UI:
Open http://localhost:8025 in your browser to view all sent emails.

### Features:
- View all emails sent by the application
- Test invitation emails and password reset flows
- Search and filter emails
- View HTML and plain text versions
- API access for automated testing

### Test sending an email:
1. Create a new user via the admin panel (POST `/api/users`)
2. The invitation email will be captured by Mailpit
3. View it at http://localhost:8025
4. Click the invitation link to test the password setup flow

### Switch to production SMTP:
To use a real SMTP server (e.g., Gmail) in production:
1. Update `.env` with production SMTP settings (see `.env.docker.example`)
2. Restart the backend: `docker-compose restart backend`

## Troubleshooting

### Backend won't start:
```bash
docker-compose logs backend
```

### Clear Redis cache:
```bash
docker exec -it submitheses-redis redis-cli FLUSHDB
```

### Emails not appearing in Mailpit:
1. Check backend logs: `docker-compose logs backend | grep -i email`
2. Verify SMTP settings in `.env` match Mailpit configuration
3. Check Mailpit is running: `docker-compose ps mailpit`
4. Check Mailpit logs: `docker-compose logs mailpit`

### Reset everything:
```bash
docker-compose down -v
docker-compose up -d --build
```

## Production

For production, update `docker-compose.yml`:
- Set `NODE_ENV=production`
- Remove volume mounts for hot reload
- Configure proper CORS origins
- Set up SSL/TLS
- Use secrets management for sensitive data
