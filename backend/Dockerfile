# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json .npmrc ./

# Install ALL dependencies (including dev) for prisma generate
RUN npm ci --audit

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY src ./src

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package.json package-lock.json .npmrc ./

# Install production dependencies only
RUN npm ci --omit=dev --audit && \
    npm cache clean --force

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Create uploads and logs directories with correct ownership
RUN mkdir -p uploads/documents logs && \
    chown -R nodeapp:nodejs /app

# Switch to non-root user
USER nodeapp

# Expose only the application port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
