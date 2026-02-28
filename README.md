# Smart Home System

A comprehensive Smart Home management system with a Node.js backend and a React frontend.

## 🏗️ Project Structure

The project is organized as a monorepo-style setup:

- `/src` — Backend application (Node.js, Fastify, PostgreSQL, MQTT).
- `/client` — Frontend application (React, Vite, TypeScript, Tailwind CSS).
- `/nginx` — Nginx configuration for proxying and SSL termination.
- `/mosquitto` — MQTT broker configuration.
- `docker-compose.yml` — Orchestration for the entire stack.

## 🚀 Key Features

- **Device Management** — Register and control smart devices via MQTT.
- **Real-time Updates** — WebSocket integration for live device state.
- **Secure Authentication** — JWT-based auth with Refresh Tokens (HttpOnly cookies).
- **OTA Updates** — Support for Over-The-Air firmware updates.
- **Containerized** — Ready for deployment with Docker.

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Run with Docker
```bash
docker-compose up --build
```
The application will be available at:
- Frontend: `http://localhost` (via Nginx)
- API: `http://localhost/api`
- MQTT: `localhost:1883`

### Local Development

#### Backend
```bash
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## 📖 Documentation

- [Backend Prompts (Internal)](./SMART_HOME_BACKEND_PROMPTS_JS.md)
- [Frontend Prompts (Internal)](./SMART_HOME_FRONTEND_PROMPT_REACT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Client README](./client/README.md)

## 🐳 Deployment

Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on production deployment using Nginx and Docker.
