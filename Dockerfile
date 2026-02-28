# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Build the backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
# Files will be in /app/client/dist in the frontend-builder stage
# We'll copy them to /app/public so they are accessible
COPY --from=frontend-builder /app/client/dist ./public

EXPOSE 3000
CMD ["node", "src/server.js"]
