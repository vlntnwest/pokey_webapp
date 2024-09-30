// routes/menuItems.js
const express = require("express");
const menuItemController = require("../controllers/menuItem.controller");

const router = express.Router();

router.get("/", menuItemController.getAllItems);
router.get("/details", menuItemController.getItemsDetails);
router.get("/custom/:category", menuItemController.getCustomInfos);
router.get("/:id", menuItemController.getOneItem);
router.post("/", menuItemController.createItem);
router.post("/details", menuItemController.createItemDeatils);
router.post("/custom", menuItemController.createCustomItem);
router.put("/:id", menuItemController.updateItem);
router.delete("/:id", menuItemController.deleteItem);

module.exports = router;
