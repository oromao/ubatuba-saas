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
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY infra/scripts/wait-for.js /infra/scripts/wait-for.js
COPY infra/assets /infra/assets
RUN chown -R nestjs:nodejs /app
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
