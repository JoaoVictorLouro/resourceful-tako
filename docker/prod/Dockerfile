FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml prisma/ ./
RUN npm install -g $(node -e "console.log(require('./package.json').packageManager)")

# Build stage
FROM base AS builder
RUN pnpm install
COPY . .
RUN pnpm run build

# Prod deps stage
FROM base AS prod_deps
RUN pnpm install --prod

# Docker stage
FROM docker:27.2-dind AS docker

# Production stage
FROM node:22-alpine AS runner
ARG RELEASE_COMMIT="unknown"
WORKDIR /app

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=true RELEASE=$RELEASE_COMMIT

COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker-compose /usr/local/bin/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=prod_deps /app/node_modules ./node_modules

RUN mkdir -p /config \
  && chmod -R 777 /config \
  && chmod -R g+s /config \
  && mkdir -p /logs \
  && chmod -R 777 /logs \
  && chmod -R g+s /logs

EXPOSE 7060

# Start the app
CMD ["npm", "start"]
