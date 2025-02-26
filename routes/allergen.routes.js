const express = require("express");
const AllergenController = require("../controllers/allergen.controller");

const router = express.Router();

router.get("/", AllergenController.getAllAllergens);
router.post("/", AllergenController.createAllergen);
router.delete("/:id", AllergenController.deleteAllergen);

module.exports = router;
