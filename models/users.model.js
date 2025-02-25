const mongoose = require("mongoose");
const { isEmail } = require("validator");

const UsersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [isEmail],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

const UsersModel = mongoose.model("users", UsersSchema);

module.exports = UsersModel;
