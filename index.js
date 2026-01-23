// Load environment variables FIRST before any other imports
require("dotenv").config({ path: "./.env" });

const express = require("express");
const usersRoutes = require("./routes/users.routes");
const menuItemRoutes = require("./routes/menuItems.routes");
const orderRoutes = require("./routes/order.routes");
const privateOrdersRoutes = require("./routes/private.orders.routes");
const tableRoutes = require("./routes/table.routes");
const allergenRoutes = require("./routes/allergen.routes");
const foodRoutes = require("./routes/food.routes");
const paymentRoutes = require("./routes/payment.routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("./config/db");
const cors = require("cors");
const checkJwt = require("./middleware/auth.middleware");

const app = express();

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

//privates routes
app.use("/api/users", checkJwt, usersRoutes);
app.use("/api/private/orders", checkJwt, privateOrdersRoutes);

//public routes
app.use("/api/item", menuItemRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/allergen", allergenRoutes);
app.use("/api/food", foodRoutes);

app.use("/api/checkout", paymentRoutes);

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
