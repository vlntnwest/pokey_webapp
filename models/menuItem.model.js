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
    type: String,
    required: true,
  },
  bowlDetails: BowlSchema,
  drinkInfo: {
    variant: {
      type: [String],
    },
    size: {
      type: Number,
    },
  }, // Only for drinks
  available: {
    type: Boolean,
    default: true,
  },
  picture: {
    type: String,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
});

const MenuItemModel = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItemModel;
