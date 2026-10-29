# ShopNest Ethiopia — AI Shopping Assistant Integration

**Project Slogan:** *"Your Marketplace, Your Way." / "የእርስዎ የገበያ መድረክ"*

---

## 1. Overview & Objective

The **ShopNest AI Shopping Assistant** is an intelligent, bilingual (English & Amharic) e-commerce assistant seamlessly integrated into the ShopNest Ethiopia MERN stack application. It allows customers to discover relevant products, explore alternatives, compare prices in Ethiopian Birr (ETB), and receive personalized recommendations grounded strictly in real database inventory.

### Key Tenets
1. **Database as Single Source of Truth:** The AI model is never allowed to fabricate products, prices, stock levels, or discounts. Every recommended product ID is cross-verified against real published MongoDB documents.
2. **Deterministic Pre-Filtering & Post-Verification:** Natural language queries are parsed into structured shopping parameters (e.g. price ceiling, category hints, in-stock requirement). Only genuine catalog items are fed to the model context.
3. **Bilingual Native Experience:** Full English and Amharic support, handling Ethiopian vocabulary ("ብር", "ላፕቶፕ", "ስልኮች", "ይርጋጨፌ ቡና", "የባህል ልብስ") and Amharic plural morphology.
4. **Security & Guardrails:** Zero customer data transmission (PII, cards, passwords, or order histories are never exposed). Prompt injections and role hijacking attempts are neutralized before reaching the provider.
5. **Cost-Free Local Development (Mock Mode):** Out of the box, `AI_MOCK_MODE=true` simulates intelligent Ethiopian shopping advice without requiring paid API keys or external network dependencies.

---

## 2. Architecture & Data Flow

```
[ Customer in Browser (React + Tailwind) ]
                   │
                   ▼  POST /api/v1/ai/shopping-assistant
[ Express Gateway (Helmet, CORS, MongoSanitize, AI Rate Limiter: 30 req/15m) ]
                   │
                   ▼  Request Validation (Zod Schema: 1-500 chars, language: en|am)
[ AI Controller & ShoppingAssistantService ]
                   │
        ┌──────────┴────────────────────────┐
        ▼                                   ▼
[ Intent Parser ]                 [ Security Guardrail ]
• Budget detection (ETB/Birr/ብር) • Neutralize prompt injections
• Category hint mapping           • Block private account access
• Plural morphology analysis
        │
        ▼
[ ProductSearchService ] ◄────► [ MongoDB (Catalog Source of Truth) ]
• Strict search: isPublished=true, stock>0, price bounds, category
• Relaxation fallback if no strict matches (explain relaxed criteria)
        │
        ▼
[ AI Provider Adapter (Isolated Service) ]
├─► MockAIProvider (Local Dev Simulation — Default, zero cost)
├─► GeminiAIProvider (Google Gemini 1.5/2.0 REST API with timeout & 429 backoff)
└─► OpenAIAIProvider (OpenAI-compatible REST API)
        │
        ▼  Model Output
[ Output Verification & ID Reconciliation ]
• Verify every model-proposed ID against DB results
• Discard fabricated IDs
• Enforce actual database prices, images, stock, and slugs
        │
        ▼
[ Standardized API Response (JSON envelope) ]
```

---

## 3. Environment Variables Configuration

Add the following configuration options to `server/.env` (or root `.env`):

```bash
# ==============================================================================
# AI Shopping Assistant Configuration
# ==============================================================================
# Provider: 'mock' (default for dev/test) | 'gemini' | 'openai'
AI_PROVIDER=mock

# Real AI Provider API Key (never exposed to React client; required if AI_MOCK_MODE=false)
AI_API_KEY=

# LLM Model Name (e.g. 'gemini-1.5-flash', 'gemini-2.0-flash', 'gpt-4o-mini')
AI_MODEL=gemini-1.5-flash

# Mock Mode: Set to 'true' to use simulated local responses with zero API costs
AI_MOCK_MODE=true

# AI Provider Request Timeout in milliseconds (default: 15000 = 15 seconds)
AI_REQUEST_TIMEOUT_MS=15000

# Maximum output generation tokens (default: 1000)
AI_MAX_OUTPUT_TOKENS=1000

# Rate limit: Max assistant requests per 15-minute window per IP (default: 30)
AI_RATE_LIMIT_MAX=30
```

---

## 4. API Specification

### Endpoint: `POST /api/v1/ai/shopping-assistant`
- **Rate Limit:** 30 requests per 15 minutes per IP.
- **Access Level:** Public (supports guest shoppers and registered users).

#### Request Body
```json
{
  "message": "Find a laptop under 40000 ETB",
  "language": "en",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hi"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you discover Ethiopian products today?"
    }
  ]
}
```

#### Amharic Request Example
```json
{
  "message": "በ15,000 ብር ውስጥ ያሉ ስልኮችን አሳየኝ።",
  "language": "am"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "answer": "Welcome to ShopNest Ethiopia! Here are the best computing options tailored for your needs under your budget:\n\n1. **Lenovo IdeaPad 3 15.6\" Laptop** — 36,000 ETB\n   Great value at 36,000 ETB with authentic specifications and 5 units currently in stock.\n\n(Simulated response — AI mock mode is active for local development without external API charges.)",
    "language": "en",
    "isMock": true,
    "provider": "ShopNest-Mock-Engine",
    "products": [
      {
        "id": "65b123456789012345678902",
        "title": "Lenovo IdeaPad 3 15.6\" Laptop",
        "titleAmharic": "ሌኖቮ አይዲያፓድ 3 ላፕቶፕ",
        "slug": "lenovo-ideapad-3-laptop",
        "price": 38500,
        "discountPrice": 36000,
        "currency": "ETB",
        "images": ["https://images.unsplash.com/photo-laptop.jpg"],
        "stock": 5,
        "rating": 4.6,
        "reviewCount": 14,
        "categoryName": "Computers & Office",
        "categorySlug": "computers",
        "recommendationReason": "Great value at 36,000 ETB with authentic specifications and 5 units currently in stock."
      }
    ],
    "explanation": null,
    "relaxedCriteria": null,
    "suggestedFollowUps": [
      "Laptops under 40,000 ETB",
      "Best for university students",
      "Compare top 2 laptops"
    ]
  },
  "timestamp": "2026-10-29T19:21:36.556Z"
}
```

---

## 5. Running the Application & Tests

### Type Check
```bash
npm run type-check
```

### Run Automated Tests
```bash
# Run all tests (Server: 117 tests, Client: 23 tests)
npm run test

# Run server AI assistant test suite only
npm run test:server -- test/ai.test.ts

# Run client AI assistant UI test suite only
npm run test:client -- test/ShoppingAssistant.test.tsx
```

### Start Development Server
```bash
# Starts both Express backend (port 5000) and Vite frontend (port 5173) concurrently
npm run dev
```

