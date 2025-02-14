const express = require("express");
const userRoutes = require("./routes/user.routes");
const usersRoutes = require("./routes/users.routes");
const menuItemRoutes = require("./routes/menuItems.routes");
const orderRoutes = require("./routes/order.routes");
const tableRoutes = require("./routes/table.routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const cors = require("cors");
const checkJwt = require("./middleware/auth.middleware");

const app = express();

// CORS
const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
};

app.use(cors(corsOption));

app.use(express.json());

//Body Parseer
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// jwt
app.use("/api/private", checkJwt);

//privates routes
app.use("/api/private/users", usersRoutes);

//public routes
app.use("/api/user", userRoutes);
app.use("/api/item", menuItemRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/table", tableRoutes);

// server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
