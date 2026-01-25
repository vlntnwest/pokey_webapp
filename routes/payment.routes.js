const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { validate } = require("../middleware/validate.middleware");
const { createCheckoutSessionSchema } = require("../validators/schemas");

router.post(
  "/create-checkout-session",
  validate({ body: createCheckoutSessionSchema }),
  paymentController.createCheckoutSession
);

// Webhook - no validation (Stripe sends raw data with signature)
router.post("/webhook", paymentController.paymentWebhook);

module.exports = router;
