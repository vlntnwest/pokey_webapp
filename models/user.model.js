const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      minLength: 3,
      maxLength: 55,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      max: 1024,
      minLength: 6,
    },
    role: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
    },
    resetToken: {
      type: String,
      default: "",
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// play function before save into db',
UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

UserSchema.statics.getUserByUsername = function (username) {
  return this.findOne({ username }).select("-password").exec();
};

const UserModel = mongoose.model("admins", UserSchema);

module.exports = UserModel;
