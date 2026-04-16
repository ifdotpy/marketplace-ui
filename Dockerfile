FROM node:24.14@sha256:80fc934952c8f1b2b4d39907af7211f8a9fff1a4c2cf673fb49099292c251cec AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/ui/marketplace/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
