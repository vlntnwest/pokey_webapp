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
    shouldGiveInformation: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UsersModel = mongoose.model("users", UsersSchema);

module.exports = UsersModel;
