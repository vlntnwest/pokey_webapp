const OrderModel = require("../models/order.model");
const { printText, printImage } = require("../utils/printer.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

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

module.exports.getOrderByPaymentId = async (req, res) => {
  const paymentId = req.params.id;

  try {
    const order = await OrderModel.findOne({ paymentId });
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error while fetching order:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.createOrder = async (req) => {
  const {
    items,
    specialInstructions,
    orderType,
    tableNumber,
    orderDate,
    isSuccess,
    clientData,
    userId,
    totalPrice,
    paymentId,
  } = req.body;

  try {
    const order = await OrderModel.create({
      userId,
      items,
      specialInstructions,
      orderType,
      tableNumber,
      orderDate,
      isSuccess,
      clientData,
      totalPrice,
      paymentId,
    });

    return order;
  } catch (error) {
    console.log(error);

    throw new Error("Error creating order");
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

module.exports.isSuccess = async (req, res) => {
  try {
    const order = await OrderModel.findById(id);
    order.isSuccess = data;
    await order.save();
    res.json({ message: "Order state update", isPayes: order.isSuccess });
  } catch (error) {
    res.status(500).json({ error: "Error toggling order state" });
  }
};

module.exports.printOrder = async (orderData) => {
  if (!orderData) {
    throw new Error("No text provided for printing");
  }

  try {
    const result = await printText(orderData);
    return result;
  } catch (error) {
    throw new Error("Error printing order");
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
    const orders = await OrderModel.find({ userId });
    if (!orders) {
      return res.status(404).send("No order found");
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error while fetching user:", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports.sendOrderConfirmation = async (orderData) => {
  if (!orderData) {
    throw new Error("No text provided for email");
  }

  const templatePath = path.join(__dirname, "../Template/emailTemplate.html");
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(source);

  const generateText = (orderData) => {
    return `
        Votre commande #${orderData.orderNumber}

        Merci pour votre commande, ${orderData.clientData.name}!

        Vous pouvez venir la récupérer :
        ${orderData.orderDate.date} à ${orderData.orderDate.time}

        Total : ${orderData.totalPrice.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
        })}

        ---

        Pokey Bar - 36 rue de la Krutenau, 67000 STRASBOURG - 03 88 96 63 39
          `;
  };

  const text = generateText(orderData);

  const html = template({
    orderNumber: orderData.orderNumber,
    clientName: orderData.clientData.name,
    orderDate: orderData.orderDate.date,
    orderTime: orderData.orderDate.time,
    totalPrice: orderData.totalPrice.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }),
  });

  try {
    await transporter.sendMail({
      from: `"Pokey Bar" <${process.env.GMAIL_ACCOUNT}>`,
      to: orderData.clientData.email,
      subject: `Votre commande #${orderData.orderNumber}`,
      text: text,
      html: html,
    });
  } catch (error) {
    throw new Error("Error sending email");
  }
};

module.exports.handleOrderCreation = async (req, res) => {
  try {
    const order = await module.exports.createOrder(req);

    // await module.exports.printOrder(order);

    if (req.body.orderType === "clickandcollect") {
      await module.exports.sendOrderConfirmation(order);
    }

    res.status(201).json({
      message: "Order created, printed, and confirmation email sent",
      orderDate: order.orderDate,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Error handling order creation:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.handleOrderPrinting = async (req, res) => {
  try {
    const orderData = req.body;
    const result = await orderController.printOrder(orderData);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
