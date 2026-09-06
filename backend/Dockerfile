# ---- deps: prod bağımlılıkları (better-sqlite3 native derleme) ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
RUN mkdir -p data uploads
EXPOSE 4000
# Migration'ı index.js'ten ÖNCE ayrı process olarak koştur: bazı servisler (ör.
# services/activityLog.js) tabloya import ANINDA `db.prepare` yapar; ESM statik importları
# index.js gövdesindeki migrate() çağrısından önce değerlendiğinden, TAZE (boş) volume'da
# tablo henüz yokken çökerdi. Ayrı migrate şemayı garanti eder (index.js'in kendi migrate()'i
# idempotent no-op olur). start.sh de native'de aynı sırayı izler.
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
