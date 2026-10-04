# Static assets are architecture-independent; build on the builder's native platform.
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run docs:build

FROM nginx:alpine
LABEL org.opencontainers.image.source="https://github.com/ArtisanCloud/PowerXDoc"
LABEL org.opencontainers.image.description="PowerX documentation website"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
