require("dotenv").config({ path: "./.env" });

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const menuRoutes = require("./routes/menu.routes");
const userRoutes = require("./routes/user.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const orderRoutes = require("./routes/order.routes");
const openingHourRoutes = require("./routes/openingHour.routes");
const memberRoutes = require("./routes/member.routes");
const statsRoutes = require("./routes/stats.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const swaggerUi = require("swagger-ui-express");
const openApiSpec = require("./docs/openapi.json");

const errorHandler = require("./middleware/error.middleware");

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
  max: 15, // 15 requests per window per IP
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

// Security headers
app.use(helmet());

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
  if (req.path === "/api/checkout/webhook") {
    return next();
  }
  cors(corsOption)(req, res, next);
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Routes
app.use("/api/user", authLimiter, userRoutes);
app.use("/api/restaurants", globalLimiter, restaurantRoutes);
app.use("/api/menu", globalLimiter, menuRoutes);
app.use("/api", globalLimiter, orderRoutes);
app.use("/api", globalLimiter, openingHourRoutes);
app.use("/api", globalLimiter, memberRoutes);
app.use("/api", globalLimiter, statsRoutes);
app.use("/api/checkout", paymentLimiter, checkoutRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
