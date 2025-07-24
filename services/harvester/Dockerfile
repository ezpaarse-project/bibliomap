FROM node:22.16.0-alpine3.22 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

RUN apk add --no-cache procps

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base
WORKDIR /usr/src/app
COPY --from=builder  /usr/src/app/node_modules ./node_modules 
COPY . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pgrep -f bin/harvest > /dev/null || exit 1

# run the application
ENTRYPOINT [ "bin/harvest" ]