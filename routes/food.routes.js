const express = require("express");
const FoodController = require("../controllers/food.controller");

const router = express.Router();

router.get("/", FoodController.getAllFoods);
router.get("/:id", FoodController.getFood);
router.post("/", FoodController.createFood);
router.put("/:id", FoodController.updateFood);
router.delete("/", FoodController.deleteFoods);

module.exports = router;
