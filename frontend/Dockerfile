# ---- build: Vite üretim derlemesi ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Canonical/OG taban URL'si build-ZAMANI gömülür (lib/seo.js). .dockerignore .env'i bilerek
# dışlar (localhost sızmasın); değer compose build.args ile geçilir. Boş kalırsa seo.js
# fallback'i (http://localhost:5501) devreye girer — prod build'de MUTLAKA geçilmeli.
ARG VITE_PUBLIC_BASE_URL
ARG VITE_SITE_NAME
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL VITE_SITE_NAME=$VITE_SITE_NAME
RUN npm run build

# ---- serve: Nginx statik + reverse-proxy ----
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
