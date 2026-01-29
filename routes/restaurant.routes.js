const express = require("express");
const router = express.Router();
const restaurantControllers = require("../controllers/restaurant.controllers");
const checkAuth = require("../middleware/auth.middleware");
const { isAdmin, isOwner } = require("../middleware/role.middleware");

router.post("/", checkAuth, restaurantControllers.createRestaurant);
router.put("/:id", checkAuth, isAdmin, restaurantControllers.updateRestaurant);
router.delete(
  "/:id",
  checkAuth,
  isOwner,
  restaurantControllers.deleteRestaurant,
);

module.exports = router;
