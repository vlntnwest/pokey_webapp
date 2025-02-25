const mongoose = require("mongoose");

const AllergenSchema = new mongoose.Schema({
  name: String,
});

const AllergenModel = mongoose.model("Allergène", AllergenSchema);
module.exports = AllergenModel;
