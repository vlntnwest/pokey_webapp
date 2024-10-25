FROM node:alpine3.18
WORKDIR /app
COPY package.json ./
run npm install
COPY . .
EXPOSE 5001
cmd [ "npm", "start"]