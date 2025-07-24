FROM node:22.16.0-alpine3.22 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base
WORKDIR /usr/src/app
COPY --from=builder  /usr/src/app/node_modules ./node_modules 
COPY . .

EXPOSE 27780

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=5 \
  CMD wget --quiet --spider http://localhost:27780 || exit 1

# run the application
ENTRYPOINT [ "node", "./src/app.js" ]