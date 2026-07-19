FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ACCESS_TOKEN_KEY=kings.bo.accessToken
ARG NEXT_PUBLIC_TOKEN_TYPE_KEY=kings.bo.tokenType
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ACCESS_TOKEN_KEY=$NEXT_PUBLIC_ACCESS_TOKEN_KEY
ENV NEXT_PUBLIC_TOKEN_TYPE_KEY=$NEXT_PUBLIC_TOKEN_TYPE_KEY

RUN npm run build

FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
