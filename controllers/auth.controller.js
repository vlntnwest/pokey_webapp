const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { signUpErrors, signInErrors } = require("../utils/error.utils");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const maxAge = 3 * 24 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const user = await UserModel.create({ username, email, password, role });
    res.status(201).json({ user: user._id });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    const errors = signUpErrors(err);
    res.status(400).send({ errors });
  }
};

module.exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.login(username, password);
    const token = createToken(user._id);
    console.log(token);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge,
    });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(400).send({ errors });
  }
};

module.exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send("Email not found");
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");
    const updateData = {};
    const id = user._id;

    // Updater user with token
    if (token) {
      updateData.resetToken = token;
      updateData.resetTokenExpiration = Date.now() + 3600000;
    }
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .send("Check your email for instructions on resetting your password");
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).send("Server error");
  }
};

module.exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const user = await UserModel.findOne({ resetToken: token });

  // Check if the token exists and is still valid
  if (user) {
    // Render a form for the user to enter a new password
    res.send(
      '<form method="post" action="/reset-password"><input type="password" name="password" required><input type="submit" value="Reset Password"></form>'
    );
  } else {
    res.status(404).send("Invalid or expired token");
  }
};

module.exports.updatePassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await UserModel.findOne({ resetToken: token });
  const currentDate = Date.now();
  const isoDate = user.resetTokenExpiration;
  let timestamp = new Date(isoDate).getTime();
  console.log(currentDate, timestamp);

  // Find the user with the given token and update their password
  if (user && currentDate < timestamp) {
    try {
      user.password = password;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      await user.save();

      return res.status(200).send("Password updated successfully");
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    res.status(404).send("Invalid or expired token");
  }
};
