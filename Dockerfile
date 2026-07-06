FROM node:22-alpine AS deps
WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app/frontend

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend ./
RUN corepack enable && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=3000
RUN corepack enable

COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/package.json ./package.json
COPY --from=builder /app/frontend/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
