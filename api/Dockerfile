# Production Dockerfile — Node.js API
FROM node:24-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev for build)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

# Copy application files
COPY --chown=nodejs:nodejs src/ ./src/
COPY --chown=nodejs:nodejs prisma/ ./prisma/

# Generate Prisma client and build TypeScript
RUN npx prisma generate && npm run build

# Remove dev dependencies
RUN npm prune --production

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the app
CMD ["npm", "start"]
