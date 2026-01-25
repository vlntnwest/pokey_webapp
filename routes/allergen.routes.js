const express = require("express");
const AllergenController = require("../controllers/allergen.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createAllergenSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", AllergenController.getAllAllergens);
router.post("/", validate({ body: createAllergenSchema }), AllergenController.createAllergen);
router.delete("/:id", validateObjectId(), AllergenController.deleteAllergen);

module.exports = router;
