FROM node:22-alpine

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install --legacy-peer-deps

COPY frontend ./
COPY demo-data /app/demo-data
RUN node scripts/index-demo-evidence.mjs
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]

