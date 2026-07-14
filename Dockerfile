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

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app ./
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["npm", "run", "start"]
