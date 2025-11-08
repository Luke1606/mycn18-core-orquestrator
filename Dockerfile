FROM node:20-slim AS base
WORKDIR /app

# Install whitelist modules into node_modules (cached layer)
COPY package.json package-lock.json* ./
RUN npm install axios lodash moment ts-pattern --no-audit --no-fund || true

# Install project deps
RUN npm install --no-audit --no-fund || true

# Copy source and build
COPY . .
RUN npm run build || true

FROM node:20-slim
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
EXPOSE 3000
CMD [ "node", "dist/server.js" ]
