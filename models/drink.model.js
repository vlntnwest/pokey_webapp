const mongoose = require("mongoose");

const DrinkSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "drink",
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
  },
});

module.exports = DrinkSchema;
