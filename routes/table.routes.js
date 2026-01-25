const express = require("express");
const router = express.Router();
const tableController = require("../controllers/table.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createTableSchema, tableNumberParamSchema } = require("../validators/schemas");

router.get("/", tableController.getTables);
router.get("/:tableNumber", validate({ params: tableNumberParamSchema }), tableController.getTable);
router.post("/", validate({ body: createTableSchema }), tableController.createTable);
router.put("/:id/toggle/", validateObjectId(), tableController.toggleTable);

module.exports = router;
