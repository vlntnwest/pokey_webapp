# Pokey Webapp Backend

Node.js/Express backend for a restaurant online ordering system. This application enables customers to place orders through a web app, with Stripe payment integration and kitchen order management.

## Features

- User authentication via Supabase (handled on frontend)
- Customer order management
- Customizable menu items with option groups
- Stripe payment integration
- Thermal printer support for kitchen orders
- Email notifications

## Tech Stack

- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **Payment:** Stripe
- **Validation:** Zod

---

## Installation

### Prerequisites

- Node.js v20.0.0 or higher
- npm v9.0.0+
- PostgreSQL database

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd pokey_webapp_backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start server with hot-reload (nodemon) |
| `npm test` | Run tests (Vitest) |

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=3000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret

# Email (Gmail)
GMAIL_ACCOUNT=your_email@gmail.com
GMAIL_NODEMAILER_PASSWORD=your_app_password

# Thermal Printer (optional)
PRINTER_HOST=192.168.1.100
PRINTER_PORT=9100
```

---

## Project Structure

```
pokey_webapp_backend/
├── index.js                   # Server entry point
├── app.js                     # Express configuration
├── package.json
├── prisma/
│   └── schema.prisma          # Database schema
├── controllers/
│   └── user.controllers.js    # User management
├── routes/
│   └── user.routes.js         # User endpoints
├── middleware/
│   ├── auth.middleware.js     # JWT verification (Supabase + Prisma)
│   └── validate.middleware.js # Zod validation
├── lib/
│   ├── supabase.js            # Supabase client
│   └── prisma.js              # Prisma client
├── validators/
│   └── schemas.js             # Zod validation schemas
├── utils/
│   ├── printer.utils.js       # Thermal printer integration
│   └── error.utils.js         # Error formatting
└── tests/
    └── sample.spec.js         # Integration tests
```

---

## API Routes

**Base URL:** `http://localhost:3000/api`

### Authentication

Authentication (signup, login, logout) is handled directly on the **frontend** via the Supabase SDK:

```js
// Frontend examples
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
```

A Supabase trigger automatically creates a corresponding row in `public.users` on signup.

The backend only verifies tokens via the `checkAuth` middleware for protected routes.

---

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required | Params |
|--------|----------|-------------|---------------|--------|
| `GET` | `/:id` | Get user data by ID | Yes | `id` (UUID) |

---

#### GET /api/users/:id

Retrieves user information by their ID.

**Required Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+33612345678",
  "role": "CLIENT"
}
```

**Errors:**
- `401`: Invalid or missing token
- `404`: User not found
- `500`: Server error

---

## Middleware

### Rate Limiting

The API applies request rate limits:

| Type | Limit | Window |
|------|-------|--------|
| Global | 100 requests/IP | 15 minutes |
| Payment | 10 requests/IP | 15 minutes |

### CORS

Configured to accept requests from `CLIENT_URL` with headers:
- `sessionId`
- `Content-Type`
- `Authorization`

### Authentication

The `checkAuth` middleware:
1. Validates the Supabase JWT token
2. Fetches the user from Prisma (with role)
3. Attaches `req.user` to the request object

Additional role middlewares (`isAdmin`, `isStaff`) check `req.user.role` for authorization.

---

## Database

### Main Entities

| Entity | Description |
|--------|-------------|
| `User` | Users (clients, admins, staff) |
| `Restaurant` | Restaurant information |
| `Category` | Menu categories |
| `Product` | Menu items |
| `OptionGroup` | Option groups for customization |
| `OptionChoice` | Available choices within a group |
| `Order` | Customer orders |
| `OrderProduct` | Products in an order |
| `OpeningHour` | Opening hours |

### User Roles

- `CLIENT`: Standard customer
- `ADMIN`: Administrator
- `STAFF`: Restaurant staff

### Order Status

- `PENDING`: Waiting
- `IN_PROGRESS`: Being prepared
- `COMPLETED`: Done
- `DELIVERED`: Delivered
- `CANCELLED`: Cancelled

---

## Tests

Run tests:

```bash
npm test
```

Tests use Vitest and Supertest to test API endpoints.

---

## Development: Testing with Postman

In development, authentication is handled directly via Supabase REST API. Follow these steps to test protected routes.

### 1. Create a test user (Signup)

**POST** `https://<SUPABASE_URL>/auth/v1/signup`

**Headers:**
```
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Get an access token (Login)

**POST** `https://<SUPABASE_URL>/auth/v1/token?grant_type=password`

**Headers:**
```
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "...",
  "user": { ... }
}
```

### 3. Use the token for protected routes

Add the `access_token` to your requests:

**Headers:**
```
Authorization: Bearer <access_token>
```

### Postman Environment Variables (recommended)

Create a Postman environment with:

| Variable | Value |
|----------|-------|
| `supabase_url` | `https://your-project.supabase.co` |
| `supabase_anon_key` | Your anon key from Supabase dashboard |
| `access_token` | (set after login) |

Then use `{{supabase_url}}`, `{{supabase_anon_key}}`, and `{{access_token}}` in your requests.

### Where to find Supabase credentials

Supabase Dashboard → Project Settings → API
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

---

## License

Private project - All rights reserved.
