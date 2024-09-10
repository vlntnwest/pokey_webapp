const mongoose = require("mongoose");

const SideSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "side",
  },
  name: {
    type: String,
    required: true,
  },
  sauces: {
    type: [String],
  },
});

module.exports = SideSchema;
