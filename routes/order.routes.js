const express = require("express");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.get("/confirmed/:id", orderController.getConfirmedOrder);
router.post("/", orderController.handleOrderCreation);
router.delete("/:id", orderController.deleteOrder);
router.put("/:id/toggle", orderController.toggleOrder);

router.post("/print-order", orderController.handleOrderPrinting);

module.exports = router;
