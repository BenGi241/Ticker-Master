# 🐳 Docker Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop on Windows)

## 🚀 Quick Start - Production

### 1. Setup Environment Variables

First, create your `.env` file from the example:

```bash
copy .env.example .env
```

Then edit `.env` and add your API keys:

```env
ALPHA_VANTAGE_API_KEY=your_actual_key
FINNHUB_API_KEY=your_actual_key
NEWS_API_KEY=your_actual_key
GEMINI_API_KEY=your_actual_key
```

### 2. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

Open your browser to: **http://localhost:3000**

### 4. Stop the Application

```bash
docker-compose down
```

---

## 🛠️ Development Mode

For development with hot-reload:

```bash
# Start development environment
docker-compose --profile dev up ticker-master-dev

# This will start:
# - Backend on http://localhost:3000
# - Frontend on http://localhost:5173
```

---

## 📋 Available Commands

```bash
# Build the image
docker-compose build

# Start in production mode
docker-compose up -d

# Start in development mode
docker-compose --profile dev up ticker-master-dev

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f ticker-master

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Check health status
docker-compose ps
```

---

## 🏥 Health Check

Check if the application is healthy:

```bash
curl http://localhost:3000/api/health
```

Or using Docker:

```bash
docker-compose exec ticker-master node -e "require('http').get('http://localhost:3000/api/health', (res) => { res.on('data', d => console.log(d.toString())); });"
```

---

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Change PORT in .env file
PORT=3001
```

Then rebuild:

```bash
docker-compose down
docker-compose up -d
```

### Container won't start

```bash
# Check logs
docker-compose logs ticker-master

# Check if .env file exists
dir .env

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### API keys not working

```bash
# Verify .env file is loaded
docker-compose exec ticker-master env | findstr API_KEY

# Restart container after changing .env
docker-compose restart ticker-master
```

---

## 📦 Image Details

- **Base Image**: node:20-alpine
- **Image Size**: ~200MB (production)
- **Security**: Runs as non-root user
- **Health Checks**: Every 30 seconds
- **Logging**: Rotated JSON logs (max 3 files, 10MB each)

---

## 🔧 Advanced Configuration

### Custom Network

The application uses a dedicated Docker network (`ticker-network`) for isolation.

### Volume Mounts (Development)

In development mode, source code is mounted for hot-reload:
- `./server.js` → `/app/server.js`
- `./api` → `/app/api`
- `./client` → `/app/client`

### Environment Variables

All environment variables from `.env` are automatically loaded.

---

## 📊 Monitoring

View real-time logs:

```bash
docker-compose logs -f ticker-master
```

Check container stats:

```bash
docker stats ticker-master-app
```

---

## 🧹 Cleanup

Remove everything:

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi ticker-master-main-ticker-master

# Remove all unused Docker resources
docker system prune -a
```

---

## 📝 Notes

- The production image uses multi-stage builds for optimization
- Frontend is built during Docker build and served by the Express server
- Development mode runs both backend (port 3000) and frontend dev server (port 5173)
- All API requests are proxied through the backend to avoid CORS issues
