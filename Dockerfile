# syntax=docker/dockerfile:1.7
FROM --platform=$BUILDPLATFORM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache libc6-compat && corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
  pnpm build

FROM node:22-alpine AS libsql

WORKDIR /opt/libsql
RUN npm init -y >/dev/null 2>&1 \
  && npm install --omit=dev --no-audit --no-fund --package-lock=false libsql@0.4.7

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_PATH=/opt/libsql/node_modules
ENV PORT=3052
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=libsql /opt/libsql /opt/libsql

RUN mkdir -p /app/data /app/data/media

EXPOSE 3052

CMD ["node", "server.js"]
