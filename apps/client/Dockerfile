FROM node:20-alpine AS build

WORKDIR /app

ARG EXPO_PUBLIC_API_BASE_URL=/
ARG EXPO_PUBLIC_ADMIN_PASSWORD=
ARG EXPO_PUBLIC_ENABLE_PCO=false
ENV EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL}
ENV EXPO_PUBLIC_ADMIN_PASSWORD=${EXPO_PUBLIC_ADMIN_PASSWORD}
ENV EXPO_PUBLIC_ENABLE_PCO=${EXPO_PUBLIC_ENABLE_PCO}

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx expo export --platform web

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
