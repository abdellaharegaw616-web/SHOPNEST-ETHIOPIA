# ShopNest Ethiopia — Environment Variables Reference

ShopNest Ethiopia enforces runtime schema validation using **Zod** for both frontend and backend configurations.

---

## 1. Server Configuration (`server/.env`)

| Variable | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :---: | :--- |
| `PORT` | `number` | `5000` | No | HTTP listening port for Express server. |
| `NODE_ENV` | `'development' \| 'production' \| 'test'` | `'development'` | Yes | Node runtime environment mode. |
| `CLIENT_URL` | `string` | `http://localhost:5173` | Yes | Frontend application origin permitted by CORS. |
| `MONGODB_URI` | `string` | `mongodb://localhost:27017/shopnest_ethiopia` | Yes | MongoDB Atlas or local MongoDB connection URI. |
| `JWT_SECRET` | `string (min 16 chars)` | `dev_secret_key_shopnest_ethiopia_2026_secure` | Yes | Cryptographic secret used for signing JWT tokens. |
| `JWT_EXPIRES_IN` | `string` | `7d` | No | JWT token validity lifespan. |
| `LOG_LEVEL` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | No | Minimum severity level recorded by structured logger. |
| `TELEGRAM_BOT_TOKEN` | `string` | `''` | No | Bot token from `@BotFather` for order notifications. Gracefully skips if omitted. |
| `TELEGRAM_DEFAULT_CHAT_ID` | `string` | `''` | No | Admin Telegram chat ID for store notifications. |
| `SMS_PROVIDER` | `'mock' \| 'africastalking' \| 'twilio' \| 'generic_http'` | `'mock'` | No | SMS gateway provider for OTP and order updates. |
| `SMS_API_KEY` | `string` | `''` | If provider != mock | API authentication key for SMS provider. |
| `SMS_SENDER_ID` | `string` | `'ShopNestET'` | No | Registered alphanumeric SMS sender ID. |
| `SMS_API_URL` | `string` | `''` | If provider = generic_http | Custom HTTP SMS gateway endpoint (e.g. Ethio Telecom). |

---

## 2. Client Configuration (`client/.env`)

| Variable | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :---: | :--- |
| `VITE_API_BASE_URL` | `string` | `/api` | Yes | Base URL path or remote host for RTK Query requests. |
| `VITE_APP_NAME` | `string` | `ShopNest Ethiopia` | No | Human-readable application title. |
| `VITE_DEFAULT_LANGUAGE` | `'en' \| 'am'` | `'en'` | No | Initial default language code. |

---

## 3. Setup Instructions

1. Copy `.env.example` at root or inside subpackages:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
2. Replace credentials (especially `MONGODB_URI` and `JWT_SECRET`) for production deployments.
3. Never commit `.env` files to git.
