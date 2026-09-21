FROM node:20-slim AS builder

WORKDIR /app

# Install client dependencies & build
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Final production stage
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built frontend assets
COPY --from=builder /app/client/dist ./client/dist

# Copy server and dependencies
COPY --from=builder /app/server ./server
COPY package.json ./

EXPOSE 5000

CMD ["node", "server/index.js"]
