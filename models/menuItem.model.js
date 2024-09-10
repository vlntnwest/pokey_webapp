const mongoose = require("mongoose");
const BowlSchema = require("./bowl.model");
const SideSchema = require("./side.model");
const DrinkSchema = require("./drink.model");
const DessertSchema = require("./dessert.model");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  bowlDetails: BowlSchema,
  sideDetails: SideSchema,
  drinkDetails: DrinkSchema,
  dessertDetails: DessertSchema,
  available: {
    type: Boolean,
    default: true,
  },
});

const MenuItemModel = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItemModel;
