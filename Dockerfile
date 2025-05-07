# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NestJS"

WORKDIR /src

ENV NODE_ENV=production

# Build stage
FROM base as build

RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY --link . ./


RUN npm run build

# Final stage for production image
FROM base

COPY --from=build /src /src

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]
