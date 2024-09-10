const mongoose = require("mongoose");

const BowlSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "bowl",
  },
  proteins: {
    type: String,
    required: true,
  },
  garnishes: {
    type: [String],
    required: true,
  },
  toppings: {
    type: [String],
    required: true,
  },
});

module.exports = BowlSchema;
