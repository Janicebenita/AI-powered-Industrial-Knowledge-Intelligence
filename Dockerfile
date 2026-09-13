FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
COPY frontend/scripts/requirements-fastembed.txt /tmp/requirements-fastembed.txt
RUN python3 -m venv /opt/fastembed && /opt/fastembed/bin/pip install --no-cache-dir -r /tmp/requirements-fastembed.txt
ENV FASTEMBED_PYTHON=/opt/fastembed/bin/python
ENV FASTEMBED_CACHE_PATH=/opt/fastembed/models

WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate && pnpm install --frozen-lockfile

COPY frontend ./
RUN /opt/fastembed/bin/python scripts/fastembed-worker.py --download > /dev/null
COPY demo-data /app/demo-data
RUN node scripts/index-demo-evidence.mjs
RUN npm run build

ENV NODE_ENV=production
ENV ENVIRONMENT=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]

