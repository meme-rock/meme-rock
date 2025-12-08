# 1. Build Aşaması
FROM node:18-alpine AS builder

WORKDIR /app

# Paket dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Tüm kaynak kodunu kopyala
COPY . .

# Build al (dist klasörü oluşur)
RUN npm run build

# 2. Production Aşaması (Daha hafif image için)
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Env variable'ları (Env dosyasını docker-compose ile vereceğiz)
ENV NODE_ENV=production

# Portu aç
EXPOSE 8080

# Uygulamayı başlat
CMD ["npm", "run", "start:prod"]