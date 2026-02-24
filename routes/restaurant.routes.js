const express = require("express");
const router = express.Router();
const restaurantControllers = require("../controllers/restaurant.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin, isOwner } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { restaurantSchema } = require("../validators/schemas");

router.post(
  "/",
  checkAuth,
  validate({ body: restaurantSchema }),
  restaurantControllers.createRestaurant,
);
router.put(
  "/:restaurantId",
  checkAuth,
  isAdmin,
  validate({ body: restaurantSchema.partial() }),
  restaurantControllers.updateRestaurant,
);
router.delete(
  "/:restaurantId",
  checkAuth,
  isOwner,
  restaurantControllers.deleteRestaurant,
);

module.exports = router;
