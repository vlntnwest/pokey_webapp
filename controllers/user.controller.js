const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

module.exports.userInfo = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(400).send("ID unknown : " + id);

  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error while fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.userProfil = async (req, res) => {
  const username = req.params.username;

  try {
    const user = await UserModel.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error while fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.updateUser = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.bio) updateData.bio = req.body.bio;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return res.send(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const deleteUser = await UserModel.deleteOne({ _id: id }).exec();

    return res.send(deleteUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
