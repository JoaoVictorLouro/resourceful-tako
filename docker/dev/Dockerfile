FROM docker:27.3-dind AS docker

FROM node:22-alpine

COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker-compose /usr/local/bin/

WORKDIR /app
EXPOSE 7060

RUN npm install -g $(node -e "console.log(require('./package.json').packageManager)") \
  && mkdir -p /pnpm-store \
  && chmod -R 777 /pnpm-store \
  && chmod -R g+s /pnpm-store \
  && mkdir -p /config \
  && chmod -R 777 /config \
  && chmod -R g+s /config \
  && mkdir -p /logs \
  && chmod -R 777 /logs \
  && chmod -R g+s /logs \
  && pnpm config set store-dir /pnpm-store;

CMD ["pnpm", "dev:docker"]
