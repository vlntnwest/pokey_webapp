const OrderModel = require("../models/order.model");
const ObjectID = require("mongoose").Types.ObjectId;
const EscPosEncoder = require("esc-pos-encoder");
const net = require("net");
const NetworkReceiptPrinter = require("esc-pos-encoder");

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

// Fonction pour générer les données ESC/POS
function generateEscPosData(order) {
  if (!order || typeof order !== "string") {
    throw new Error("La commande doit être une chaîne de caractères");
  }

  const encoder = new EscPosEncoder();

  try {
    // Initialiser l'imprimante
    encoder.initialize();

    // Vérifiez que 'order' est une chaîne de caractères valide
    encoder.align("center").text(order).newline();

    // Couper le papier
    encoder.cut();

    // Retourner les données encodées
    return encoder.encode();
  } catch (err) {
    console.error("Erreur lors de l'encodage ESC/POS :", err);
    throw err;
  }
}

// Fonction pour envoyer les données à l'imprimante
async function sendToPrinter(escposData) {
  return new Promise((resolve, reject) => {
    const receiptPrinter = new NetworkReceiptPrinter({
      host: "86.243.245.213",
      port: 9100,
    });

    receiptPrinter.addEventListener("connected", (device) => {
      console.log(`Connected to printer`);
    });
  });
}

// Fonction de gestion des commandes
exports.printOrder = async (req, res) => {
  const { order } = req.body;

  try {
    // Générer les données ESC/POS à partir de la commande
    const escposData = generateEscPosData(order);
    console.log("Données ESC/POS générées :", escposData);

    // Envoyer les données à l'imprimante
    await sendToPrinter(escposData);

    res.json({ message: "Commande envoyée pour impression" });
  } catch (err) {
    console.error("Erreur lors de l'impression :", err);
    res.status(500).json({ error: "Erreur lors de l'impression" });
  }
};
