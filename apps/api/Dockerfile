FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/api/package.json ./package.json
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY infra/scripts/wait-for.js /infra/scripts/wait-for.js
COPY infra/assets /infra/assets
EXPOSE 4000
CMD ["node", "dist/main.js"]
