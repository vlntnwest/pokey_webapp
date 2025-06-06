const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    orderType: {
      type: String,
      enum: ["dine-in", "clickandcollect"],
      required: true,
    },
    tableNumber: {
      type: Number,
      required: function () {
        return this.orderType === "dine-in";
      },
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
            type: [String],
            // Only for custom
          },
          extraProtein: {
            type: [String],
            default: [],
          },
          extraProteinPrice: {
            type: Number,
            default: 0,
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
          price: {
            type: Number,
          },
        },
      ],
      required: true,
    },
    orderDate: {
      type: {
        date: {
          type: String,
        },
        time: {
          type: String,
        },
      },
      required: function () {
        return this.orderType === "clickandcollect";
      },
    },
    specialInstructions: {
      type: String,
    },
    totalPrice: {
      type: Number,
    },
    clientData: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isSuccess: {
      type: Boolean,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.plugin(AutoIncrement, { inc_field: "orderNumber" });

const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel;
