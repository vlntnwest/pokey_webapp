const TableModel = require("../models/table.model");

module.exports.getTables = async (req, res) => {
  const tables = await TableModel.find();
  res.status(200).json(tables);
};

module.exports.createTable = async (req, res) => {
  const { tableNumber } = req.body;

  try {
    const table = await TableModel.create({ tableNumber });
    res.status(201).json({ table: table._id });
  } catch (err) {
    console.error("Erreur lors de la création de la table :", err);
    res.status(400).send({ err });
  }
};

module.exports.toggleTable = async (req, res) => {
  try {
    const table = await TableModel.findById(req.params.id);
    table.isOpen = !table.isOpen;
    await table.save();
    res.json({ message: "Table state updated", isOpen: table.isOpen });
  } catch (error) {
    res.status(500).json({ error: "Error toggling table state" });
  }
};
