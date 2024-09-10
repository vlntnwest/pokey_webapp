const mongoose = require("mongoose");

const DessertSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "dessert",
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = DessertSchema;
