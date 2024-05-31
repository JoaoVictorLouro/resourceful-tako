ARG UPGRADE_PACKAGES="false"

FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

RUN export DEBIAN_FRONTEND=noninteractive \
  && apt-get update \
  && apt-get -y -q install --no-install-recommends \
    bat \
    dnsutils \
    libgtk2.0-0 \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libgbm-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    procps \
    xauth \
    xvfb \
    fonts-noto-color-emoji \
    fonts-arphic-bkai00mp \
    fonts-arphic-bsmi00lp \
    fonts-arphic-gbsn00lp \
    fonts-arphic-gkai00mp \
    fonts-arphic-ukai \
    fonts-arphic-uming \
    ttf-wqy-zenhei \
    ttf-wqy-microhei \
    xfonts-wqy \
  && mkdir -p /workspace \
  && chmod -R 777 /workspace \
  && chmod -R g+s /workspace \
  && mkdir -p /pnpm-store \
  && chmod -R 777 /pnpm-store \
  && chmod -R g+s /pnpm-store \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV ENVIRONMENT=development DOCKER_DEVCONTAINER=1
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null

WORKDIR /workspace

EXPOSE 7060

COPY . .
