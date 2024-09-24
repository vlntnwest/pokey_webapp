const mongoose = require("mongoose");
const BowlSchema = require("./bowl.model");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["bowl", "side", "drink", "dessert", "custom"],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  bowlDetails: BowlSchema,
  drinkSize: {
    type: String,
  }, // Only for drinks
  available: {
    type: Boolean,
    default: true,
  },
  picture: {
    type: String,
  },
});

const MenuItemModel = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItemModel;
