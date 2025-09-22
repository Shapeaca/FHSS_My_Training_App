FROM node:alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma/ prisma/

RUN npm ci

COPY tsconfig*.json angular.json fhss.json ./
COPY public/ public/
COPY src/ src/

RUN npm run build:prod


FROM node:alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/ ./prisma/
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

EXPOSE 4000

CMD ["npm", "run", "start:prod"]

