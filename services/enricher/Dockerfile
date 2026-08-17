FROM node:24.14.1-alpine3.23 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base
WORKDIR /usr/src/app
COPY --from=builder  /usr/src/app/node_modules ./node_modules 
COPY . .

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s CMD ["node", "./healthcheck.js"]

USER node

EXPOSE 3000

ENTRYPOINT [ "node", "./src/app.js" ]
