FROM node:20-alpine AS build
WORKDIR /app


RUN apk add --no-cache \
  python3 make g++ pkgconf \
  cairo-dev pango-dev jpeg-dev giflib-dev \
  && ln -sf /usr/bin/python3 /usr/bin/python

COPY package*.json ./
ENV PYTHON=/usr/bin/python3
RUN npm ci --no-audit --fund=false

COPY . .

ARG VITE_PUBLIC_API_URL
ENV VITE_PUBLIC_API_URL=${VITE_PUBLIC_API_URL}


RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
