const express = require("express");
const usersRoutes = require("./routes/users.routes");
const menuItemRoutes = require("./routes/menuItems.routes");
const orderRoutes = require("./routes/order.routes");
const tableRoutes = require("./routes/table.routes");
const allergenRoutes = require("./routes/allergen.routes");
const foodRoutes = require("./routes/food.routes");
const paymentRoutes = require("./routes/payment.routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
require("./config/db");
const cors = require("cors");
const checkJwt = require("./middleware/auth.middleware");

const app = express();

// CORS
const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type", "Authorization"],
  exposedHeaders: ["sessionId"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
};

app.use(cors(corsOption));

app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

//Body Parseer
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

//privates routes
app.use("/api/users", checkJwt, usersRoutes);

//public routes
app.use("/api/item", menuItemRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/allergen", allergenRoutes);
app.use("/api/food", foodRoutes);

app.use("/api/checkout", paymentRoutes);

// server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
