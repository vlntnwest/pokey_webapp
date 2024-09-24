const mongoose = require("mongoose");

const MenuTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["bowl", "side", "drink", "dessert", "custom"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const MenuTypeModel = mongoose.model("MenuType", MenuTypeSchema);
module.exports = MenuTypeModel;
