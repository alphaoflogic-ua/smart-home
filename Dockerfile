FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.lock* ./
RUN npm install --production --frozen-lockfile

COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
