const express = require("express");
const orderController = require("../controllers/order.controller");
const { validateObjectId } = require("../middleware/validate.middleware");

const router = express.Router();

// Specific routes MUST come before parameterized routes
router.get("/", orderController.getAllOrders);
router.get("/history/:userId", orderController.getUserOrders);
router.get("/tables/:tableNumber", orderController.getTableOrders); // Fixed: added missing slash
router.get("/:id", validateObjectId(), orderController.getOrder);

module.exports = router;
