const express = require("express");
const FoodController = require("../controllers/food.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createFoodSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", FoodController.getAllFoods);
router.get("/:id", validateObjectId(), FoodController.getFood);
router.post("/", validate({ body: createFoodSchema }), FoodController.createFood);
router.put("/:id", validateObjectId(), FoodController.updateFood);
router.delete("/", FoodController.deleteFoods);

module.exports = router;
