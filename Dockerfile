# Build stage: install, verify and build. Any failing test or type error aborts the image build.
FROM node:24.21-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm test && npm run check && npm run build

# Runtime stage: only the built game, served by nginx as a non-root user on port 8080.
FROM nginxinc/nginx-unprivileged:1.30-alpine
# The base image runs as uid 101; switch to root only to remove its demo pages.
USER root
RUN rm -rf /usr/share/nginx/html/*
USER 101
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chmod=755 docker/40-legal-json.sh /docker-entrypoint.d/40-legal-json.sh
COPY --chmod=755 docker/41-dev-json.sh /docker-entrypoint.d/41-dev-json.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
