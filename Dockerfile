# ---- build Nuxt static ----
FROM node:20-alpine AS build
WORKDIR /app

ARG NUXT_PUBLIC_API_BASE=https://spt-api.pnmn.click
ARG NUXT_PUBLIC_API_ORIGIN=https://spt-api.pnmn.click
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_API_ORIGIN=$NUXT_PUBLIC_API_ORIGIN
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run generate

# ---- nginx ----
FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
