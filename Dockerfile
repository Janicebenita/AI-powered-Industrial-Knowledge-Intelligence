FROM node:22-bookworm-slim AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/pnpm-workspace.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend ./
RUN mkdir -p public
ENV NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
RUN corepack enable && pnpm build

FROM python:3.12-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV INTERNAL_API_URL=http://127.0.0.1:8000
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=frontend-builder /usr/local/bin/node /usr/local/bin/node

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend ./backend
COPY demo-data ./demo-data
COPY sample_data ./sample_data
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY deploy/start.sh ./deploy/start.sh

RUN chmod +x ./deploy/start.sh
EXPOSE 3000
CMD ["./deploy/start.sh"]
