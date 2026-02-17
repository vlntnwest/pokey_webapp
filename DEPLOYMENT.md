# Deployment Guide - Hostinger

## Node.js Version Requirements

This application requires **Node.js v20 LTS** to run properly.

### Why Node v20?

- `express-oauth2-jwt-bearer@1.6.0` does not support Node v22
- `canvas` (used for thermal printer image printing) has pre-built binaries for Node v20
- Better stability and compatibility with all dependencies

## Configure Node.js Version on Hostinger

### Option 1: Via Hostinger Control Panel (Recommended)

1. Log in to your **Hostinger Control Panel**
2. Go to **Advanced** → **Application Settings**
3. Find **Node.js Version** selector
4. Select **Node.js 20.x LTS**
5. Click **Save**
6. Rebuild your application

### Option 2: Via .nvmrc (Automatic)

The project includes a `.nvmrc` file specifying Node v20. If your hosting supports NVM, it will automatically use the correct version.

### Option 3: Via package.json engines

The `package.json` specifies the required Node version:

```json
"engines": {
  "node": ">=18.0.0 <=20.x",
  "npm": ">=9.0.0"
}
```

## Troubleshooting

### Canvas Module Issues

If you encounter `canvas` build errors:

1. **Canvas is now optional** - The app will work without it (except `printImage` function)
2. For Node v20, canvas has pre-built binaries (no Python/build tools needed)
3. If issues persist, ensure Node v20 is being used

### Package Deprecation Warnings

The following warnings are safe to ignore:
- `crypto@1.0.1` - Removed from dependencies (use built-in Node crypto)
- `esc-pos-encoder` packages - Maintained and functional despite deprecation warnings

### Build Failing?

If npm install still fails:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install with legacy peer dependencies
npm install --legacy-peer-deps
```

## Deployment Checklist

- [ ] Node.js v20 configured on hosting
- [ ] All environment variables set in Hostinger
- [ ] Stripe webhook URL configured in Stripe Dashboard
- [ ] STRIPE_WEBHOOK_SECRET_KEY matches Stripe webhook secret
- [ ] Database connection string is correct
- [ ] Printer settings configured (if using thermal printing)

## Environment Variables Required

```bash
PORT=5001
CLIENT_URL=https://your-frontend-url.com
DB_USER_PASS=mongodb://...
PRINTER_PORT=9100
PRINTER_HOST=192.168.x.x
AUTH0_CLIENT_SECRET=...
AUTH0_CLIENT_ID=...
AUTH0_AUDIENCE=...
AUTH0_DOMAIN=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET_KEY=whsec_...
GMAIL_ACCOUNT=your@email.com
GMAIL_NODEMAILER_PASSWORD=...
```

## Webhook Configuration

Make sure to configure your Stripe webhook in the Dashboard:

**URL:** `https://your-domain.com/api/checkout/webhook`

**Events to send:**
- `checkout.session.completed`
- `payment_intent.payment_failed` (optional)

**Get the webhook secret** and add it to your environment variables as `STRIPE_WEBHOOK_SECRET_KEY`.
