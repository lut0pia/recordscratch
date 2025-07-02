# syntax=docker/dockerfile:1

FROM node:18-alpine
EXPOSE 80/tcp

WORKDIR /app/common
COPY ./common/package*.json /app/common/
RUN npm install

WORKDIR /app/server
COPY ./server/package*.json /app/server/
RUN npm install

COPY ./common /app/common
COPY ./server /app/server

CMD ["node", "src/js/index.js"]
