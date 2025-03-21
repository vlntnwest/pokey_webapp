const express = require("express");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrder);
router.get("/history/:userId", orderController.getUserOrders);
router.post("/", orderController.createOrder);
router.delete("/:id", orderController.deleteOrder);
router.put("/:id/toggle", orderController.toggleOrder);

router.get("tables/:tableNumber", orderController.getTableOrders);

router.post("/print-order", orderController.printOrder);
router.post("/print-pic", orderController.printPic);

module.exports = router;
