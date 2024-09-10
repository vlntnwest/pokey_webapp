// routes/menuItems.js
const express = require("express");
const menuItemController = require("../controllers/menuItem.controller");

const router = express.Router();

router.get("/", menuItemController.getAllItems);
router.get("/:id", menuItemController.getOneItem);
router.post("/", menuItemController.createItem);
router.put("/:id", menuItemController.updateItem);
router.delete("/:id", menuItemController.deleteItem);

module.exports = router;
