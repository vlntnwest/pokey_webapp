const express = require("express");
const router = express.Router();
const tableController = require("../controllers/table.controler");

router.get("/", tableController.getTables);
router.post("/", tableController.createTable);
router.put("/:id/toggle/", tableController.toggleTable);

module.exports = router;
