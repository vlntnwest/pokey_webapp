const OrderModel = require("../models/order.model");
const { printText, printImage } = require("../utils/printer.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_NODEMAILER_PASSWORD,
  },
});

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
  } catch (error) {
    console.error("Error while fetching order:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.createOrder = async (req, res) => {
  const {
    items,
    specialInstructions,
    archived,
    orderType,
    tableNumber,
    orderDate,
    isSuccess,
    clientData,
    userId,
    totalPrice,
  } = req.body;

  try {
    const order = await OrderModel.create({
      userId,
      items,
      specialInstructions,
      archived,
      orderType,
      tableNumber,
      orderDate,
      isSuccess,
      clientData,
      totalPrice,
    });

    // await printOrder({ body: { orderData: order } });
    await this.sendOrderConfirmation({ body: { orderData: order } });

    res
      .status(201)
      .json({ orderDate: order.orderDate, orderNumber: order.orderNumber });
  } catch (error) {
    res.status(400).json({ error: error });
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
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getTableOrders = async (req, res) => {
  const tableNumber = req.params.tableNumber;

  try {
    const order = await OrderModel.find({ tableNumber });
    res.status(200).json(order);
  } catch (error) {
    console.error("Error while fetching order:", error);
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
  const { orderData } = req.body;

  if (!orderData) {
    return res.status(400).json({ error: "No text provided for printing" });
  }

  try {
    const result = await printText(orderData);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error("[🧾 THERMAL] Error:", error);
    res.status(500).json({ error: "Error printing order" });
  }
};

module.exports.printPic = async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res
      .status(400)
      .json({ status: "error", message: "No image provided" });
  }

  try {
    const result = await printImage(image);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error("[🧾 THERMAL] Error processing the image:", error);
    res.status(500).json({
      status: "error",
      message: "Error encoding the image",
    });
  }
};

module.exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectID.isValid(userId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    const order = await OrderModel.find({ userId });
    if (!order) {
      return res.status(404).send("No order found");
    }
    res.send(order);
  } catch (error) {
    console.error("Error while fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.sendOrderConfirmation = async (req, res) => {
  const { orderData } = req.body;
  console.log(orderData);

  if (!orderData) {
    return res.status(400).json({ error: "No text provided for email" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Pokey Bar" <${process.env.GMAIL_ACCOUNT}>`,
      to: orderData.clientData.email,
      subject: `Votre commande #${orderData.orderNumber}`,
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
    res.send(info);
  } catch (error) {
    console.error("Error while sending email:", error);
    res.status(500).send("Internal Server Error");
  }
};
