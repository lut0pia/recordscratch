# syntax=docker/dockerfile:1

FROM node:18-alpine AS builder

WORKDIR /app/common
COPY ./common/package*.json /app/common/
RUN npm install

WORKDIR /app/client
COPY ./client/package*.json /app/client/
RUN npm install

COPY ./common /app/common
COPY ./client /app/client
RUN npm run web-build

FROM nginx:alpine
EXPOSE 80/tcp
COPY --from=builder /app/client/dist /usr/share/nginx/html
