const express = require("express");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrder);
router.post("/", orderController.createOrder);
router.delete("/:id", orderController.deleteOrder);

router.get("/tables/:tableNumber", orderController.getTableOrders);

module.exports = router;
