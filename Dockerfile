# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

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
RUN pnpm prune --prod
RUN rm -rf /app/.next/cache /app/.next/standalone

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/payload ./payload
COPY --from=builder /app/payload.config.ts ./payload.config.ts
COPY --from=builder /app/scripts/bootstrap-payload-db.mjs ./scripts/bootstrap-payload-db.mjs
RUN mkdir -p /app/data /app/data/media

EXPOSE 3052

CMD ["sh", "-c", "NODE_ENV=development pnpm payload run ./scripts/bootstrap-payload-db.mjs && pnpm start"]
