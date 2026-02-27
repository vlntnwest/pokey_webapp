const express = require("express");
const router = express.Router();
const checkoutControllers = require("../controllers/checkout.controllers");
const { validate } = require("../middleware/validate.middleware");
const { checkoutSessionSchema } = require("../validators/schemas");

router.post(
  "/create-session",
  validate({ body: checkoutSessionSchema }),
  checkoutControllers.createCheckoutSession,
);

module.exports = router;
