# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# Stage 1 — Build the React SPA
# ---------------------------------------------------------------------------
FROM node:20-alpine AS client-builder
WORKDIR /client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


# ---------------------------------------------------------------------------
# Stage 2 — Install production-only server dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS server-deps
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force


# ---------------------------------------------------------------------------
# Stage 3 — Final runtime
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    CLIENT_DIST=/app/client/dist

RUN addgroup -S app && adduser -S app -G app

COPY --from=server-deps   /app/node_modules   ./node_modules
COPY server/package.json                      ./
COPY server/src                               ./src
COPY --from=client-builder /client/dist       ./client/dist

RUN chown -R app:app /app
USER app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]
