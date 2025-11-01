# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.11.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

FROM base AS build

ARG PNPM_VERSION=10.20.0

COPY . .

RUN apk add g++ make py3-pip
RUN npm -g install pnpm@${PNPM_VERSION}
RUN pnpm install
RUN pnpm build:prod

FROM base AS final

ARG APP_NAME=bot

COPY --from=build /app/apps/${APP_NAME}/dist .

CMD [ "node", "index.js" ]
