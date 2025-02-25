const express = require("express");
const router = express.Router();
const tableController = require("../controllers/table.controller");

router.get("/", tableController.getTables);
router.get("/:tableNumber", tableController.getTable);
router.post("/", tableController.createTable);
router.put("/:id/toggle/", tableController.toggleTable);

module.exports = router;
