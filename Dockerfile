# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app/

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies (if package-lock.json exists uses ci, otherwise install)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev --no-audit; fi

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Set environment variables
ENV NODE_ENV=production \
    PORT=6767

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies (runs only if dependencies exist, creates clean layer)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev --no-audit; fi

# Copy application source code
COPY index.js ./

# Ensure files are owned by the non-root node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

# Expose application port
EXPOSE 6767

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:6767/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "index.js"]
