const mongoose = require("mongoose");

const CustomSchema = new mongoose.Schema({
  category: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  hasSauce: {
    type: Boolean,
  },
});

const CustomDetailsModel = mongoose.model("CustomDetails", CustomSchema);
module.exports = CustomDetailsModel;
