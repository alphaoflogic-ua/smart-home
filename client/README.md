# Smart Home Client

Frontend part of the "Smart Home" system, built on a modern tech stack with a focus on performance, accessibility, and scalability.

## 🚀 Tech Stack

- **React 19** — UI library.
- **Vite** — Next-generation build tool.
- **TypeScript** — Static typing for enhanced reliability.
- **Tailwind CSS 4** — Utility-first CSS framework for rapid styling.
- **Headless UI v2** — Accessible, unstyled UI components (modals, switches, inputs).
- **Axios** — HTTP client with token handling interceptors.
- **React Router 7** — Routing with protected routes.
- **Lucide React** — Icon set.

## 🏗️ Architecture

The project is inspired by the **Feature-Sliced Design (FSD)** methodology:

- `app/` — Application initialization (providers, global styles).
- `pages/` — Page components.
- `features/` — Business-value functionality (Auth, WebSocket).
- `router/` — Routing configuration and access control.
- `shared/` — Reusable code (UI kit, API client, types, layout).

### Core Rules:
- **No `default exports`** — use named exports only.
- **No `index.ts` (barrel files)** — import directly from files for better tree-shaking and to avoid circular dependencies.

## 🔑 Authentication

JWT-based authorization system:
- `accessToken` is stored in memory only (`window._accessToken`) to prevent XSS.
- `refreshToken` is handled via HttpOnly Cookies (configured on the backend).
- Axios interceptors automatically refresh the token on expiration (401 error).

## 🛠️ Getting Started

### Development
```bash
npm install
npm run dev
```
By default, the project proxies `/api` requests to `http://localhost:3333`.

### Build
```bash
npm run build
```
The output will be in the `dist` directory.

## 🐳 Docker
To run the entire stack (backend + frontend + nginx), use `docker-compose` in the repository root.
