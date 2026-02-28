FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

EXPOSE 5001

CMD ["node", "index.js"]
