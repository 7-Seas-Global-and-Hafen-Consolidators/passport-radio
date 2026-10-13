FROM node:24-alpine
WORKDIR /app
COPY backend ./backend
COPY data/store_inventory*.json ./data/
ENV PORT=3000 STORE_DB_PATH=/var/lib/passport-store/store.sqlite
EXPOSE 3000
CMD ["node","backend/server.mjs"]
