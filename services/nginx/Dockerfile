FROM nginx:1.29.1-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template

ARG ENV=development

RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:80 || exit 1

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]