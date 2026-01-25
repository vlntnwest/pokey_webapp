const express = require("express");
const orderController = require("../controllers/order.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createOrderSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/confirmed/:id", validateObjectId(), orderController.getConfirmedOrder);
router.post("/", validate({ body: createOrderSchema }), orderController.handleOrderCreation);
router.delete("/:id", validateObjectId(), orderController.deleteOrder);
router.put("/:id/toggle", validateObjectId(), orderController.toggleOrder);

router.post("/print-order", orderController.handleOrderPrinting);

module.exports = router;
