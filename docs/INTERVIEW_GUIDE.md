# ShopNest Ethiopia — Engineering & Technical Interview Guide (25+ Q&A)

> **"Your Marketplace, Your Way."** / **"የእርስዎ የገበያ መድረክ"**  
> Comprehensive technical interview questions and architectural deep-dives designed to explain every critical engineering decision behind ShopNest Ethiopia.

---

## Table of Contents
1. [Core Monorepo & Full-Stack Architecture (Q1–Q4)](#1-core-monorepo--full-stack-architecture-q1q4)
2. [Database Design, MongoDB Modeling & Indexes (Q5–Q8)](#2-database-design-mongodb-modeling--indexes-q5q8)
3. [Concurrency, Inventory Safety & E-Commerce Business Logic (Q9–Q12)](#3-concurrency-inventory-safety--e-commerce-business-logic-q9q12)
4. [Cart Architecture & Session Synchronization (Q13–Q15)](#4-cart-architecture--session-synchronization-q13q15)
5. [Authentication, Security & Session Management (Q16–Q19)](#5-authentication-security--session-management-q16q19)
6. [Ethiopian Localization & Payment Engineering (Q20–Q22)](#6-ethiopian-localization--payment-engineering-q20q22)
7. [Frontend Architecture, RTK Query & Performance (Q23–Q25)](#7-frontend-architecture-rtk-query--performance-q23q25)
8. [Production Readiness, Deployment & Testing (Q26–Q28)](#8-production-readiness-deployment--testing-q26q28)

---

## 1. Core Monorepo & Full-Stack Architecture (Q1–Q4)

### Q1: Why did you architect ShopNest Ethiopia as an npm workspace monorepo instead of separate polyrepos?
**Answer:**
A monorepo structure (`shared/`, `server/`, `client/`) was chosen to eliminate drift between frontend and backend contracts.
1. **Zero-drift Type Sharing**: The `@shopnest/shared` package houses the canonical TypeScript interfaces, DTOs (Data Transfer Objects), enums (`OrderStatus`, `PaymentMethod`, `Role`), validation constants (`ETHIOPIA_CONSTANTS`), and brand design tokens (`BRAND`).
2. **Single Build & Verification Pipeline**: Running `npm test` or `npm run type-check` validates the entire dependency graph end-to-end. If an order schema field changes in `@shopnest/shared`, both Express controllers and React Redux hooks fail type-checking immediately during compilation before reaching production.
3. **Atomic Versioning**: Feature releases (such as adding coupon discount tracking) are committed atomically across contracts, backend handlers, and UI components in a single Pull Request.

### Q2: What is the exact request lifecycle in the ShopNest backend?
**Answer:**
Every incoming HTTP request traverses an explicit 8-stage pipeline:
1. **Helmet & Security Headers**: Sets HTTP security headers (X-Frame-Options, XSS protections, HSTS).
2. **CORS Middleware**: Validates caller origins against trusted white-listed client origins with credential support (`Access-Control-Allow-Credentials: true`).
3. **Rate Limiting**: `express-rate-limit` enforces IP rate ceilings on sensitive routes (e.g., 20 attempts / 15 minutes for auth endpoints).
4. **Body Parsing & Mongo Sanitization**: Parses JSON and runs `express-mongo-sanitize` to strip any prohibited MongoDB operators (`$`, `.`) from request payloads.
5. **Request Logging**: Custom contextual Morgan logger records method, route, IP, status code, and latency in milliseconds.
6. **Authentication & Authorization**: `authenticate` or `optionalAuthenticate` validates JWT signatures from either `Authorization: Bearer` headers or secure HTTP-only cookies.
7. **Zod Schema Validation Middleware**: Incoming request bodies, queries, and route params are validated against strict Zod schemas before hitting business logic.
8. **Controller & Service Layer**: Controllers unpack inputs and delegate orchestration to domain services; all exceptions funnel into a centralized error handling middleware (`errorHandler.ts`).

### Q3: How do you enforce separation of concerns between Controllers and Services?
**Answer:**
- **Controllers** (`src/controllers/`) are strictly HTTP transport adapters: they unpack HTTP request params, query strings, and body payloads; call the appropriate service method; and format the standardized `ApiResponse<T>` JSON envelope with proper HTTP status codes (200, 201, 400, 401, 404, 500). Controllers contain no database queries or complex mathematical calculations.
- **Services** (`src/services/`) contain pure domain logic: calculating subtotals, verifying coupons, checking stock thresholds, performing atomic database queries, creating audit log movements, and managing compensation rollbacks. Services are unaware of HTTP requests or responses, making them 100% testable in unit tests without mocking Express req/res objects.

### Q4: How is strict TypeScript typing enforced across the codebase?
**Answer:**
Both backend and frontend extend a common `tsconfig.base.json` configured with:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: false` (to ensure interoperability with optional DTO fields).
Build scripts compile `shared/dist/` before server and client type checks, ensuring type definitions are strictly resolved from compiled declarations.

---

## 2. Database Design, MongoDB Modeling & Indexes (Q5–Q8)

### Q5: How is the database indexed for high-performance e-commerce queries?
**Answer:**
We created strategic single-field, compound, text, and TTL indexes in Mongoose:
- **Product Text Search**: Text index on `{ title: 'text', titleAmharic: 'text', description: 'text', descriptionAmharic: 'text' }` for lightning-fast catalog search queries.
- **Product Catalog Filters**: Compound index on `{ category: 1, price: 1, stock: 1, isPublished: 1 }` to support faceted browsing and price range sorting without in-memory collection scans.
- **Idempotent Orders**: Unique, sparse index on `{ idempotencyKey: 1 }` to block duplicate checkout attempts from duplicate button clicks or network retries.
- **Order Search & Auditing**: Indexes on `{ orderNumber: 1 }` (unique) and `{ user: 1, createdAt: -1 }` for instant retrieval of customer order histories.
- **Cart Uniqueness**: Unique sparse index on `{ user: 1 }` and `{ guestSessionId: 1 }`.
- **Review Deduplication**: Compound unique index on `{ product: 1, user: 1 }` guaranteeing each customer can review a product at most once.
- **Session Auto-Purge**: MongoDB TTL (Time-To-Live) index on `RefreshSession` collection: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`, offloading session cleanup entirely to MongoDB's internal background purge thread.

### Q6: Why did you separate Order Status from Payment Status?
**Answer:**
Tying order state directly to payment status creates brittle e-commerce systems prone to edge-case bugs:
- An order can be **`orderStatus: 'pending'`** while **`paymentStatus: 'pending'`** (customer placed order via Telebirr but hasn't finalized PIN prompt).
- An order can be **`orderStatus: 'processing'`** while **`paymentStatus: 'completed'`** (payment confirmed, warehouse is packing the goods).
- An order can be **`orderStatus: 'processing'`** while **`paymentStatus: 'pending'`** when **Cash on Delivery** is chosen (the merchant delivers first, and payment status only transitions to `completed` upon doorstep courier collection).
- An order can be **`orderStatus: 'cancelled'`** while **`paymentStatus: 'refunded'`**.
Keeping `orderStatus` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) and `paymentStatus` (`pending`, `completed`, `failed`, `refunded`) decoupled allows accurate tracking of logistics independent of cash flows.

### Q7: Why are product prices snapshotted directly onto order line items?
**Answer:**
Product prices in the `products` collection fluctuate over time due to promotions, inflation, or seasonal sales. If an order simply stored references (`productId`) and read prices dynamically, historical customer orders and financial tax audits would be retroactively corrupted when a product price changes.
In `OrderSchema.items`, each item permanently snapshots:
`productId`, `title`, `titleAmharic`, `price`, `quantity`, `sku`, `image`, and `subtotal`. The customer is forever billed what was agreed upon at the exact moment of order placement.

### Q8: What is the purpose of the `InventoryMovement` collection?
**Answer:**
Instead of silently mutating `Product.stock`, every single stock alteration creates an immutable audit trail in `InventoryMovement`:
- `type`: `stock_in` (restocking), `stock_out` (damaged/written off), `order_reservation` (customer checkout), `cancellation_return` (cancelled order returned to inventory), or `adjustment` (manual inventory reconciliation).
- Records `product`, `quantity`, `previousStock`, `newStock`, `referenceId` (Order ID or Admin ID), and human-readable `reason`. This satisfies compliance requirements for enterprise physical auditing in Addis Ababa fulfillment hubs.

---

## 3. Concurrency, Inventory Safety & E-Commerce Business Logic (Q9–Q12)

### Q9: How does ShopNest Ethiopia prevent overselling under high concurrency?
**Answer:**
We prevent race conditions and inventory overselling using **Atomic Conditional Updates** at the database engine level:
```typescript
const updatedProduct = await Product.findOneAndUpdate(
  {
    _id: item.productId,
    stock: { $gte: item.quantity },
    isPublished: true,
  },
  {
    $inc: { stock: -item.quantity },
  },
  { new: true }
);
```
Because MongoDB guarantees document-level atomicity on single-document operations, if 10 customers simultaneously attempt to purchase the last unit in stock (`stock = 1`), only the first query matches `{ stock: { $gte: 1 } }` and atomically decrements it to `0`. The other 9 queries return `null`.

### Q10: How do you handle multi-item checkout rollback without requiring a replica set cluster?
**Answer:**
While MongoDB transaction sessions (`session.startTransaction()`) work seamlessly in distributed replica sets, standalone instances or local development clusters reject transaction commands.
To provide 100% resilient consistency across all MongoDB deployment topologies, ShopNest implements an **Optimistic Reservation with Compensation Rollback** pattern:
1. The service loops sequentially through all checkout items, attempting atomic conditional decrements.
2. An in-memory ledger `reservedItems` records every successfully decremented product.
3. If any subsequent item fails due to insufficient stock, a `StockConflictException` is thrown, triggering the `rollbackCompensation` block:
   ```typescript
   for (const reserved of reservedItems) {
     await Product.findByIdAndUpdate(reserved.productId, {
       $inc: { stock: reserved.quantity },
     });
   }
   ```
4. All previously deducted units are immediately returned to inventory, ensuring zero partial reservations or leaked inventory locks.

### Q11: How is the checkout process protected against duplicate submissions (Idempotency)?
**Answer:**
Network hiccups or double-clicking the "Place Order" button can cause duplicate payments or double order creation.
1. The frontend generates a unique UUID `Idempotency-Key` header for each checkout attempt.
2. The `Order` model enforces a `unique`, `sparse` index on `idempotencyKey`.
3. In `order.service.ts`, before processing any inventory reservation, the service queries:
   ```typescript
   const existingOrder = await Order.findOne({ idempotencyKey });
   if (existingOrder) return existingOrder;
   ```
4. If an identical request arrives while the first is in-flight, MongoDB's unique index catches any race condition with error code `11000` (Duplicate Key), and the existing order document is safely returned without duplicate inventory deduction or double charging.

### Q12: Why is the backend the absolute source of truth for pricing and totals?
**Answer:**
A fundamental rule in secure e-commerce architecture is **Never Trust the Client**. Malicious actors can modify client-side Redux states, tamper with JavaScript variables in DevTools, or forge POST payloads via curl to send `price: 1` or `discount: 9999`.
In ShopNest Ethiopia:
- The frontend only submits `productId` and `quantity`.
- The backend queries the current live price from the database.
- The backend validates coupon eligibility, verifies minimum order requirements, enforces maximum discount caps, calculates Ethiopian regional delivery fees, and computes the canonical grand total.

---

## 4. Cart Architecture & Session Synchronization (Q13–Q15)

### Q13: How does ShopNest support both authenticated customer carts and guest carts?
**Answer:**
The `Cart` collection supports dual identity modes via sparse indexing:
- For authenticated customers: indexed by `user: ObjectId`.
- For guest visitors: indexed by a persistent `guestSessionId: string` generated on the client via `crypto.randomUUID()` and stored in `localStorage`.
- The Express `optionalAuthenticate` middleware inspects tokens: if a valid JWT exists, `req.user` is populated; if not, the route handler operates against `guestSessionId`.

### Q14: How does the system handle cart merging when a guest user logs in?
**Answer:**
When an unauthenticated visitor adds items to their guest cart and subsequently registers or logs in:
1. The frontend dispatches a `mergeCart` mutation passing the `guestSessionId`.
2. The backend fetches both the guest cart and the authenticated user's cart.
3. For each item in the guest cart:
   - If the item already exists in the user cart, quantities are summed (bounded by current stock).
   - If the item does not exist, it is appended to the user cart.
4. Live prices and stock are re-evaluated against the product collection.
5. The temporary guest cart document is purged from MongoDB, and the merged cart is saved and returned.

### Q15: How does the cart alert users to real-time price and stock fluctuations?
**Answer:**
When `getCart()` or `updateCartItem()` executes, the backend compares the price snapshotted when the item was added against the product's live catalog price, and compares requested quantity against current stock.
If differences exist:
- The backend updates the cart item's price and adjusts quantity down to available stock if needed.
- A `warnings: CartWarning[]` array is returned containing localized alert messages (e.g., *"Item price changed from 500 ETB to 550 ETB"*, *"Quantity adjusted to 3 due to limited stock"*).
- The React storefront renders vibrant, high-visibility warning banners informing the shopper before they proceed to checkout.

---

## 5. Authentication, Security & Session Management (Q16–Q19)

### Q16: Explain your JWT authentication architecture and Refresh Token Rotation strategy.
**Answer:**
ShopNest implements an enterprise-grade dual-token model:
- **Access Token**: Short-lived JWT (15-minute TTL) containing `userId` and `role`. Stored in memory or short-lived cookie for rapid stateless authorization.
- **Refresh Token**: Long-lived cryptographic token (7-day TTL) stored inside a secure, `HttpOnly`, `SameSite: strict` cookie inaccessible to JavaScript (preventing XSS exfiltration).
- **Rotation with Reuse Detection**:
  1. Each refresh token is hashed (SHA-256) and stored in the `RefreshSession` collection.
  2. When `/api/v1/auth/refresh` is called, the provided token is verified and immediately replaced with a new token (one-time use).
  3. If a compromised refresh token is re-submitted (token reuse attack), the server flags the session as breached, revokes all active refresh sessions for that user account, and forces a re-login.

### Q17: How is Role-Based Access Control (RBAC) implemented?
**Answer:**
Access control is enforced at both the route middleware level and controller level:
```typescript
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }
    next();
  };
};
```
Routes under `/api/v1/admin/*` chain `authenticate` followed by `authorize('admin')`. If a standard `customer` attempts to access admin endpoints, a 403 Forbidden structured error is returned. On the frontend, routes are guarded with an `AccessDeniedPage` fallback.

### Q18: How are passwords protected at rest and in transit?
**Answer:**
1. **In Transit**: All HTTP communications are strictly HTTPS-ready with security headers managed by Helmet.
2. **At Rest**: Passwords are salted and hashed using `bcryptjs` with a work factor of 10 rounds before saving.
3. **Mongoose Projection Protection**: The `password` field on `UserSchema` is configured with `select: false`. It is never returned in default Mongoose queries or JSON serialization, eliminating accidental exposure in API logs or profile responses.

### Q19: How does the backend prevent NoSQL injection attacks?
**Answer:**
1. **Sanitization Middleware**: `express-mongo-sanitize` scrubs all incoming `req.body`, `req.query`, and `req.params`, stripping dangerous operators like `$gt: ""` or `$ne: null` that attackers use to bypass authentication queries.
2. **Strict Zod Parsing**: All endpoint inputs are strictly typed and parsed with Zod schemas. If a field expects a string and receives an object, Zod rejects the request with HTTP 400 before database execution.
3. **Mongoose Schema Casting**: Mongoose enforces strong schema typing on document queries.

---

## 6. Ethiopian Localization & Payment Engineering (Q20–Q22)

### Q20: How are Ethiopian phone numbers validated?
**Answer:**
Ethiopia's telecommunications landscape features two major operators: Ethio telecom (prefixes `09...` / `+2519...`) and Safaricom Ethiopia (prefixes `07...` / `+2517...`).
We created a standardized regular expression shared across both frontend and backend:
`^(?:\+251|0)(?:9\d{8}|7\d{8})$`
- Enforces international format `+251` or national format `0`.
- Requires operator code `9` or `7`.
- Enforces exactly 8 subsequent digits (total 9 digits after prefix).
- Validated via Zod on backend registration and real-time regex feedback on the checkout form.

### Q21: How are delivery fees and free shipping calculated for Ethiopia?
**Answer:**
Delivery costs are computed based on destination tier and order volume:
1. **Addis Ababa Deliveries**: All 11 sub-cities (Bole, Kirkos, Yeka, Arada, Lideta, Addis Ketema, Nifas Silk-Lafto, Kolfe Keranio, Gullele, Akaki Kality, Lemi Kura) receive express local dispatch at a standard fee of **150 ETB**.
2. **Regional Deliveries**: Destinations across Oromia, Amhara, Sidama, Dire Dawa, Tigray, Somali, Harari, Afar, and SNNP regional hubs are charged **250 ETB**.
3. **Free Delivery Threshold**: Any order with a subtotal equal to or exceeding **2,500 ETB** automatically receives **0 ETB** free shipping anywhere in Ethiopia.
The cart page features an interactive progress bar indicating how many ETB remain to qualify for free shipping.

### Q22: How does the simulated payment provider mimic real Ethiopian fintech workflows?
**Answer:**
To allow seamless local development and portfolio demonstration without requiring active bank merchant contracts:
1. Supported methods: `telebirr`, `cbe_birr`, `chapa`, and `cash_on_delivery`.
2. When an order is placed, a pending `Payment` record is created with a generated transaction reference (`TXN-ETH-...`).
3. For digital methods, the client renders a clearly marked **Simulated Payment Sandbox**.
4. The user can simulate both successful authorization (`action: 'success'`) and payment failure (`action: 'failure'`).
5. Only upon verified backend callback transition does `paymentStatus` become `completed` and `orderStatus` become `processing`. Under no circumstances is an order marked paid merely because a user navigated to a URL.

---

## 7. Frontend Architecture, RTK Query & Performance (Q23–Q25)

### Q23: Why Redux Toolkit + RTK Query over alternative data-fetching libraries?
**Answer:**
1. **Normalized Cache Management**: RTK Query automatically caches API responses, eliminates duplicate background fetches, and handles automatic cache invalidation using `providesTags` and `invalidatesTags` (`['Products', 'Cart', 'Orders', 'AdminStats']`).
2. **Synchronized Client & Server State**: Global UI state (shopping cart slideover visibility, active language, auth session) and server cache reside in a unified Redux store with DevTools debugging.
3. **Optimistic Updates**: RTK Query enables instant optimistic quantity updates in the cart while the server validates in the background.

### Q24: How does ShopNest implement internationalization (i18n) for English and Amharic?
**Answer:**
- Built using `i18next` and `react-i18next` with language switcher in the header.
- **Client UI Translation**: Stored in `client/src/i18n/locales/en.json` and `am.json` covering navigation, cart terminology, button labels, and policy summaries.
- **Catalog Translations**: The MongoDB product schema provides both `title` / `titleAmharic` and `description` / `descriptionAmharic`. The UI dynamically selects the language-appropriate property based on the active Redux locale.
- **Typography**: Includes Noto Sans Ethiopic alongside Inter font for crisp, legible Amharic character rendering.

### Q25: How is frontend performance optimized for Ethiopian network conditions?
**Answer:**
To accommodate varying internet connectivity speeds:
1. **Vite Code Splitting & Chunking**: Dynamic bundling prevents monolithic JS transfers; initial vendor chunks are minimized.
2. **Skeleton Shimmers & Loading States**: Skeletons maintain visual stability and prevent layout shifts (CLS) while data loads.
3. **RTK Query Stale-While-Revalidate**: Cached catalog data displays immediately on navigation while fresh inventory syncs in the background.
4. **Optimized Images**: Web-optimized URLs with compressed dimensions and responsive breakpoints.

---

## 8. Production Readiness, Deployment & Testing (Q26–Q28)

### Q26: What is the testing architecture across the monorepo?
**Answer:**
ShopNest employs an automated testing pyramid:
1. **Server Unit & Integration Tests (Vitest + Supertest)**: 48 automated test suites covering:
   - Health diagnostics & 404 boundaries
   - Registration, login, validation, and JWT authentication
   - Product catalog queries, search, and pagination
   - Concurrent checkout inventory reservation & rollback compensation
   - Idempotency key deduplication
   - Coupon discount limits and threshold calculations
   - Payment provider state transitions
2. **Client Component Tests (Vitest + React Testing Library)**: 11 tests verifying brand identity mounting, catalog interactions, Ethiopian phone validation, payment method selection, and order summary rendering.
3. **Full Pass Rate**: 59 out of 59 automated tests passing (100% pass rate).

### Q27: How would you deploy ShopNest Ethiopia to production?
**Answer:**
- **Frontend**: Deployed to **Vercel** or **Netlify** with SPA rewrite rules (`/* -> /index.html`).
- **Backend API**: Deployed to **Render**, **Railway**, or **AWS ECS** containerized with Node.js 20 LTS.
- **Database**: **MongoDB Atlas** M10+ replica set cluster hosted in a low-latency African region (e.g., `af-south-1` Johannesburg) or European region (`eu-central-1` Frankfurt) with IP access whitelisting.
- **Asset Storage**: **Cloudinary** for image uploading, automated thumbnail transformation, and global CDN delivery.
- **Process Management**: Docker containers managed with health check probes on `/api/health`.

### Q28: If you had to scale ShopNest to 100,000 daily orders, what architectural enhancements would you make?
**Answer:**
1. **Distributed Caching (Redis)**: Introduce Redis for product catalog read-through caching and user session storage, reducing read load on MongoDB by up to 80%.
2. **Message Queues (RabbitMQ / Apache Kafka)**: Decouple order checkout from non-critical tasks (sending SMS delivery confirmations via Ethio telecom SMPP gateways, sending email receipts, and updating analytics).
3. **MongoDB Read Replicas**: Route search queries and admin analytics to secondary read replica nodes, keeping primary nodes dedicated solely to write operations and atomic inventory updates.
4. **Elasticsearch / Typesense**: Implement a dedicated full-text search engine with phonetic fuzzy matching for transliterated Amharic product names.
