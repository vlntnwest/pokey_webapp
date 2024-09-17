const OrderModel = require("../models/order.model");
const ObjectID = require("mongoose").Types.ObjectId;
const EscPosEncoder = require("esc-pos-encoder");
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

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

// WebSocket : Écoute des connexions
wss.on("connection", (ws) => {
  console.log("iPad connecté au WebSocket");

  // Écouter les messages reçus du client WebSocket
  ws.on("message", (message) => {
    console.log(`Message reçu du client: ${message}`);
    // Traiter les messages du client si nécessaire
  });

  // Gestion des erreurs
  ws.on("error", (error) => {
    console.error("Erreur WebSocket :", error);
  });

  // Déconnexion du client
  ws.on("close", () => {
    console.log("iPad déconnecté du WebSocket");
  });
});

exports.printOrder = async (req, res) => {
  const { order } = req.body;
  const orders = [];

  try {
    // Générer les commandes ESC/POS pour l'impression
    const encoder = new EscPosEncoder();
    const escposData = encoder.initialize().text("Hello World!").encode();

    // Envoyer les données à tous les clients connectés via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(Buffer.from(escposData).toString("base64"));
      }
    });

    res.json({ message: "Commande envoyée à l'iPad pour impression" });
  } catch (err) {
    console.error("Erreur lors de l'impression de la commande :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de l'impression de la commande" });
  }
};
