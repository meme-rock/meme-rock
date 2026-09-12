# Tek servis image'ı: client + API + bot webhook + cron ucu aynı process'te.
# GitHub'a bağlı platformlarda (Koyeb, Render, Cloud Run, Railway) repo kökünü
# build context olarak seçmek yeterlidir.

# ─────────────────────────────────────────────────────────────
# 1) Client build
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS client

WORKDIR /client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./

# Client ve API aynı origin'de olduğu için API adresleri GÖRELİ kalmalı.
# Bu değerler build sırasında koda gömülür; boş bırakılırsa istekler
# "/user", "/ton" gibi aynı origin'e gider.
ARG VITE_API_URL=""
ARG VITE_TON_URL=""
ARG VITE_ADSGRAM_BLOCK_ID=""

RUN printf 'VITE_API_URL=%s\nVITE_TON_URL=%s\nVITE_ADSGRAM_BLOCK_ID=%s\n' \
      "$VITE_API_URL" "$VITE_TON_URL" "$VITE_ADSGRAM_BLOCK_ID" > .env.production \
    && npm run build

# ─────────────────────────────────────────────────────────────
# 2) Server build
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS server

WORKDIR /server

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ─────────────────────────────────────────────────────────────
# 3) Runtime
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=server /server/dist ./dist
# main.ts bu klasörü otomatik bulur ve SPA'yı buradan yayınlar
COPY --from=client /client/dist ./public

# Platform PORT'u kendi enjekte eder; main.ts process.env.PORT'u okur
EXPOSE 8080

CMD ["node", "dist/main"]
