const OrderModel = require("../models/order.model");
const { printText } = require("../utils/printer.utils");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllOrders = async (req, res) => {
  const orders = await OrderModel.find();
  res.status(200).json(orders);
};

module.exports.getOrder = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(400).send("ID unknown : " + id);

  try {
    const order = await OrderModel.findById(req.params.id);
    res.status(200).json(order);
  } catch (err) {
    console.error("Error while fetching order:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.createOrder = async (req, res) => {
  const { tableNumber, items, specialInstructions, archived } = req.body;

  try {
    const order = await OrderModel.create({
      tableNumber,
      items,
      specialInstructions,
      archived,
    });
    res.status(201).json({ order: order._id });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

module.exports.deleteOrder = async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send("ID unknown : " + id);
  }

  try {
    const deleteOrder = await OrderModel.deleteOne({ _id: id }).exec();

    return res.send(deleteOrder);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getTableOrders = async (req, res) => {
  const tableNumber = req.params.tableNumber;

  try {
    const order = await OrderModel.find({ tableNumber });
    res.status(200).json(order);
  } catch (err) {
    console.error("Error while fetching order:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.toggleOrder = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    order.isArchived = !order.isArchived;
    await order.save();
    res.json({ message: "Order state updated", isArchived: order.isArchived });
  } catch (error) {
    res.status(500).json({ error: "Error toggling order state" });
  }
};

module.exports.printOrder = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided for printing" });
  }

  try {
    const result = await printText(text);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error("[🧾 THERMAL] Error:", error);
    res.status(500).json({ error: "Error printing order" });
  }
};
