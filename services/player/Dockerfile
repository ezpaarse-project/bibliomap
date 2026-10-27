FROM node:26.12.1-alpine3.24 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.31.8-alpine3.24 AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]