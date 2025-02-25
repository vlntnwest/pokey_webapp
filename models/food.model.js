const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  allergens: [
    {
      allergen: {
        type: String,
        required: true,
      },
      allergen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allergen",
      },
      level: {
        type: String,
        enum: ["non", "trace", "oui"],
        default: "non",
      },
    },
  ],
});

const FoodModel = mongoose.model("Food", FoodSchema);
module.exports = FoodModel;
