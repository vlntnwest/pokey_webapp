// routes/menuItems.js
const express = require("express");
const menuItemController = require("../controllers/menuItem.controller");
const { validate, validateObjectId } = require("../middleware/validate.middleware");
const { createMenuItemSchema, createCustomItemSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", menuItemController.getAllItems);
router.get("/details", menuItemController.getItemsDetails);
router.get("/custom/:category", menuItemController.getCustomInfos);
router.get("/:id", validateObjectId(), menuItemController.getOneItem);
router.post("/", validate({ body: createMenuItemSchema }), menuItemController.createItem);
router.post("/details", menuItemController.createItemDeatils);
router.post("/custom", validate({ body: createCustomItemSchema }), menuItemController.createCustomItem);
router.put("/:id", validateObjectId(), menuItemController.updateItem);
router.delete("/:id", validateObjectId(), menuItemController.deleteItem);

module.exports = router;
