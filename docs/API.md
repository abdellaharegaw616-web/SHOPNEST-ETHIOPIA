# ShopNest Ethiopia — API Specification (v1)

> **"Your Marketplace, Your Way."** / **"የእርስዎ የገበያ መድረክ"**

The ShopNest Ethiopia REST API is built on Express, TypeScript, and MongoDB/Mongoose. All responses follow standardized JSON wrappers, Ethiopian currency formatting in ETB, and Africa/Addis_Ababa timezone timestamps.

---

## Interactive Documentation (Swagger UI)

- **Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **OpenAPI 3.0 Schema**: [http://localhost:5000/api/docs.json](http://localhost:5000/api/docs.json)

---

## Base URLs

- **API Base**: `http://localhost:5000/api`
- **V1 Base**: `http://localhost:5000/api/v1`
- **Client Dev Proxy**: `http://localhost:5173/api`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public (Rate Limited) | Register customer with name, email, password, and Ethiopian phone number (`+2519...` / `09...`). |
| `POST` | `/api/v1/auth/login` | Public (Rate Limited) | Login with email & password. Issues access token & rotates refresh token session. |
| `POST` | `/api/v1/auth/refresh` | Public (Rate Limited) | Rotates refresh token and returns fresh access token. |
| `POST` | `/api/v1/auth/logout` | Public | Revokes refresh session and clears auth cookies. |
| `GET` | `/api/v1/auth/me` | Customer / Admin | Returns current authenticated user profile and addresses. |
| `PATCH` | `/api/v1/auth/profile` | Customer / Admin | Update profile name, phone number, and base64 profile picture avatar. |
| `POST` | `/api/v1/auth/addresses` | Authenticated | Add and save an Ethiopian delivery address to customer profile. |
| `POST` | `/api/v1/auth/forgot-password` | Public (Rate Limited) | Initiates password reset flow. |
| `POST` | `/api/v1/auth/reset-password` | Public (Rate Limited) | Resets password using valid reset token. |

---

## 2. Product & Category Endpoints (`/api/v1/products`, `/api/v1/categories`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/categories` | Public | List all active categories. |
| `POST` | `/api/v1/categories` | Admin | Create a new product category. |
| `GET` | `/api/v1/products` | Public | Paginated product search with filters: `category`, `search`, `minPrice`, `maxPrice`, `sort`. |
| `GET` | `/api/v1/products/:slug` | Public | Retrieve single product details by slug. |
| `POST` | `/api/v1/products` | Admin | Create product with ETB pricing, stock, SKU, and Amharic titles. |
| `PUT` | `/api/v1/products/:id` | Admin | Update product information and track inventory changes. |
| `DELETE` | `/api/v1/products/:id` | Admin | Remove product from catalog. |

---

## 3. Cart & Wishlist Endpoints (`/api/v1/cart`, `/api/v1/wishlist`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/cart` | User / Guest | Fetch active shopping cart with live price/stock validation and warnings. |
| `POST` | `/api/v1/cart/items` | User / Guest | Add item to cart with stock validation. |
| `PUT` | `/api/v1/cart/items/:itemId` | User / Guest | Update item quantity in cart with live stock bounding. |
| `DELETE` | `/api/v1/cart/items/:itemId` | User / Guest | Remove item from cart. |
| `DELETE` | `/api/v1/cart` | User / Guest | Clear shopping cart. |
| `POST` | `/api/v1/cart/merge` | Authenticated | Safely merge guest session cart into user account cart on login. |
| `GET` | `/api/v1/wishlist` | Authenticated | Retrieve user wishlist items. |
| `POST` | `/api/v1/wishlist/toggle` | Authenticated | Toggle product in/out of wishlist. |

---

## 4. Orders & Payments Endpoints (`/api/v1/orders`, `/api/v1/payments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/orders` | Auth / Guest | Atomic checkout with idempotency key (`Idempotency-Key` header), Ethiopian address, coupon, and payment method (`telebirr`, `cbe_birr`, `chapa`, `cash_on_delivery`). |
| `GET` | `/api/v1/orders` | Authenticated | List order history for current customer. |
| `GET` | `/api/v1/orders/:id` | Authenticated | Retrieve order details and tracking timeline. |
| `PATCH` | `/api/v1/orders/:id/status` | Admin | Update order status (`processing`, `shipped`, `delivered`, `cancelled`). |
| `GET` | `/api/v1/payments/order/:orderId` | Authenticated | Retrieve payment transaction status. |
| `POST` | `/api/v1/payments/simulate` | Public / Dev | Development payment simulation sandbox (`action: 'success' \| 'failure'`). |
| `POST` | `/api/v1/auth/addresses` | Authenticated | Add and save an Ethiopian delivery address to customer profile. |

---

## 5. Admin Analytics & Inventory Endpoints (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/stats` | Admin | Overall revenue in ETB, orders, customer counts, and low-stock alerts. |
| `GET` | `/api/v1/admin/users` | Admin | Paginated list of registered users. |
| `GET` | `/api/v1/admin/inventory` | Admin | Audit trail of inventory movements (`stock_in`, `stock_out`, `order_reservation`). |
| `GET` | `/api/v1/admin/orders` | Admin | Filterable list of all orders across the platform. |

---

## 6. Ethiopian Specifics & Localization

- **Currency**: ETB (`Br` / Ethiopian Birr).
- **Timezone**: `Africa/Addis_Ababa` (UTC+3) used for business-facing timestamps.
- **Phone Validation**: Standard Ethiopian mobile formats (`+2519...`, `09...`, `+2517...`, `07...`).
- **Payment Providers**: `telebirr` (Ethio telecom), `cbe_birr` (CBE), `chapa` (Online banking/cards), and `cash_on_delivery`.
