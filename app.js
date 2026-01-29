require("dotenv").config({ path: "./.env" });

const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const restaurantRoutes = require("./routes/restaurant.routes");

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
app.use("/api/user", authLimiter, userRoutes);
app.use("/api/restaurants", authLimiter, restaurantRoutes);

// Public routes

module.exports = app;
