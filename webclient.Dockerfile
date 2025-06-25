# syntax=docker/dockerfile:1

FROM node:18-alpine AS builder
WORKDIR /app/client
COPY ./common /app/common
COPY ./client /app/client
RUN npm install && npm install --prefix ../common
RUN npm run web-build
CMD ["node", "src/js/index.js"]

FROM nginx:alpine
EXPOSE 80/tcp
COPY --from=builder /app/client/dist /usr/share/nginx/html
