# ==========================================
# Multi-stage Dockerfile for Ticker-Master
# ==========================================

# ============ Stage 1: Build Frontend ============
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY client/ ./

# Build the frontend
RUN npm run build

# ============ Stage 2: Build Backend ============
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY server.js ./
COPY api/ ./api/

# ============ Stage 3: Production Runtime ============
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy backend dependencies from builder
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./
COPY --from=backend-builder /app/server.js ./
COPY --from=backend-builder /app/api ./api

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/client/dist ./client/dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
