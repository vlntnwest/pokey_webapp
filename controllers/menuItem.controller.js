const MenuItemModel = require("../models/menuItem.model");
const MenuTypeModel = require("../models/menuType.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllItems = async (req, res) => {
  const items = await MenuItemModel.find();
  res.status(200).json(items);
};

module.exports.getItemsDetails = async (req, res) => {
  const details = await MenuTypeModel.find();
  res.status(200).json(details);
};

module.exports.getOneItem = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(400).send("ID unknown : " + id);

  try {
    const item = await MenuItemModel.findById(req.params.id);
    res.status(200).json(item);
  } catch (err) {
    console.error("Error while fetching item:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.createItem = async (req, res) => {
  const {
    type,
    name,
    description,
    price,
    bowlDetails,
    picture,
    isPopular,
    drinkInfo,
  } = req.body;

  try {
    const item = await MenuItemModel.create({
      type,
      name,
      description,
      price,
      bowlDetails,
      picture,
      isPopular,
      drinkInfo,
    });
    res.status(201).json({ item: item._id });
  } catch (err) {
    res.status(400).json({ error: "Impossible de créer le plat." });
  }
};

module.exports.createItemDeatils = async (req, res) => {
  const { type, title, description } = req.body;

  try {
    const item = await MenuTypeModel.create({
      type,
      title,
      description,
    });
    res.status(201).json({ item: item._id });
  } catch (err) {
    res.status(400).json({ error: "Impossible de créer la description." });
  }
};

module.exports.updateItem = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const updateData = {};
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.bowlDetails) updateData.bowlDetails = req.body.bowlDetails;
    if (req.body.available) updateData.available = req.body.available;

    const updatedItem = await MenuItemModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const deleteItem = await MenuItemModel.deleteOne({ _id: id }).exec();

    return res.send(deleteItem);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
