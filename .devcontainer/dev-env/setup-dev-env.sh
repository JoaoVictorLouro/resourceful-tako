#!/bin/bash
set -e

RED_COLOR='\033[0;31m'
GREEN_COLOR='\033[0;32m'
NO_COLOR='\033[0m'

export $(cat .env | sed 's/#.*//g' | xargs)

echo -e "${GREEN_COLOR}# Installing project node dependencies...${NO_COLOR}"
npm install -g pnpm@^9.4.0;
pnpm config set store-dir /pnpm-store;
pnpm install;
pnpm exec next telemetry disable;

echo -e "${GREEN_COLOR}# Done!"

echo
