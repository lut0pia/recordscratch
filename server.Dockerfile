# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app/server
EXPOSE 80/tcp
COPY ./server /app/server
COPY ./common /app/common
RUN npm install && npm install --prefix ../common
CMD ["node", "src/js/index.js"]
