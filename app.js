require("dotenv").config({ path: "./.env" });

const express = require("express");
const rateLimit = require("express-rate-limit");
const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const menuItemRoutes = require("./routes/menuItems.routes");
const orderRoutes = require("./routes/order.routes");
const privateOrdersRoutes = require("./routes/private.orders.routes");
const tableRoutes = require("./routes/table.routes");
const allergenRoutes = require("./routes/allergen.routes");
const foodRoutes = require("./routes/food.routes");
const paymentRoutes = require("./routes/payment.routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const checkJwt = require("./middleware/auth.middleware");
require("./config/db");

const app = express();

// Rate limiting configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts, please try again later." },
  skip: (req) => req.path === "/webhook", // Skip webhook (Stripe calls)
});

// Webhook route FIRST - before CORS to avoid blocking Stripe requests
app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

// CORS
const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type", "Authorization"],
  exposedHeaders: ["sessionId"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
};

// Apply CORS to all routes EXCEPT webhook
app.use((req, res, next) => {
  // Skip CORS for webhook endpoint - Stripe uses signature verification
  if (req.path === "/api/checkout/webhook") {
    return next();
  }
  cors(corsOption)(req, res, next);
});

app.use(express.json());

//Body Parseer
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Private routes (with auth rate limiter)
app.use("/api/users", authLimiter, checkJwt, usersRoutes);
app.use("/api/private/orders", authLimiter, checkJwt, privateOrdersRoutes);

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/item", menuItemRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/allergen", allergenRoutes);
app.use("/api/food", foodRoutes);

// Payment routes (with payment rate limiter)
app.use("/api/checkout", paymentLimiter, paymentRoutes);

module.exports = app;
