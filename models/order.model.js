const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  items: {
    type: [
      {
        type: {
          type: String,
          required: true,
          enum: ["bowl", "side", "drink", "dessert", "custom"],
        },
        name: {
          type: String,
          required: true,
        },
        base: {
          type: String, // Only for bowl and custom
          default: "",
        },
        proteins: {
          type: String,
          // Only for custom
        },
        extraProtein: {
          name: {
            type: String, // Only for bowl and custom
          },
          quantity: {
            type: Number,
          },
        },
        garnishes: {
          type: [String],
          // Only for custom
        },
        toppings: {
          type: [String],
          // Only for custom
        },
        sauces: {
          type: [String], // Only for bowl, custom and side
          default: [],
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  specialInstructions: {
    type: String,
  },
});

const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel;
