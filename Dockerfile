FROM node:22.17 AS build

COPY ./ /app

WORKDIR /app
RUN --mount=type=secret,id=common_repository_token COMMON_REPOSITORY_TOKEN=$(cat /run/secrets/common_repository_token) npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/ui/marketplace/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
