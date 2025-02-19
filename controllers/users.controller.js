const UsersModel = require("../models/users.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UsersModel.find();
  res.status(200).json(users);
};

module.exports.create = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersModel.create({ email });
    res.status(201).json({ user: user._id });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    res.status(400).send("Erreur lors de la création de l'utilisateur");
  }
};

module.exports.userInfo = async (req, res) => {
  const email = req.params.email;
  const userId = req.auth.sub;

  try {
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error while fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.updateUser = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(400).send("ID unknown : " + id);

  try {
    const updateData = {};

    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.phone) updateData.phone = req.body.phone;

    const updatedUser = await UsersModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, setDefaultsOnInsert: true }
    ).exec();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error while updating user:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const deleteUser = await UsersModel.deleteOne({ _id: id }).exec();

    return res.send(deleteUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
