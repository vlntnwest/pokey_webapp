require("dotenv").config();
const { handleOrderCreation } = require("./order.controller");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia; custom_checkout_beta=v1;",
});

module.exports.createCheckoutSession = async (req, res) => {
  try {
    const { email, stripeItems, data, totalPrice } = req.body;

    if (totalPrice < 0.5) {
      return res.status(400).json({ error: "Montant minimum requis : 0.50 €" });
    }

    function splitStringToMetadataParts(key, value, chunkSize = 490) {
      const chunks = value.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];
      return chunks.reduce((acc, chunk, i) => {
        acc[`${key}_part_${i + 1}`] = chunk;
        return acc;
      }, {});
    }

    const formattedMetadata = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "object") {
        const jsonValue = JSON.stringify(value);
        if (jsonValue.length > 490) {
          Object.assign(
            formattedMetadata,
            splitStringToMetadataParts(key, jsonValue)
          );
        } else {
          formattedMetadata[key] = jsonValue;
        }
      } else {
        formattedMetadata[key] = String(value);
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: stripeItems,
      metadata: formattedMetadata,
      customer_email: email,
      mode: "payment",
      payment_method_types: ["card"],
      ui_mode: "custom",
      return_url: process.env.CLIENT_URL,
    });

    res.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (err) {
    console.error("Erreur Stripe Checkout:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la session de paiement." });
  }
};

module.exports.paymentWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

  if (!endpointSecret) {
    console.error("Webhook Error: STRIPE_WEBHOOK_SECRET_KEY is not configured");
    return res.status(500).send("Webhook Error: Server configuration error");
  }

  if (!sig) {
    console.error("Webhook Error: Missing stripe-signature header");
    return res.status(400).send("Webhook Error: Missing signature");
  }

  let event;

  function reconstructFromMetadata(metadata, keyPrefix) {
    const parts = Object.entries(metadata)
      .filter(([k]) => k.startsWith(`${keyPrefix}_part_`))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
      .join("");

    if (!parts || parts.length === 0) {
      return null;
    }

    try {
      return JSON.parse(parts);
    } catch (err) {
      console.error(`Error parsing reconstructed metadata for key "${keyPrefix}":`, err.message);
      return null;
    }
  }

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    //Event when payment happen
    case "checkout.session.completed":
      console.log("Payment was successful!");

      const metadata = event.data.object.metadata;

      try {
        // Validate metadata exists
        if (!metadata) {
          console.error("Webhook Error: Missing metadata in checkout session");
          return res.status(400).json({ error: "Missing metadata" });
        }

        const formattedData = {
          ...metadata,
          clientData: metadata.clientData
            ? JSON.parse(metadata.clientData)
            : null,
          orderDate: metadata.orderDate ? JSON.parse(metadata.orderDate) : null,
          items:
            reconstructFromMetadata(metadata, "items") ??
            (metadata.items ? JSON.parse(metadata.items) : null),
          totalPrice: parseFloat(metadata.totalPrice),
          isSuccess: true,
          paymentId: event.data.object.id,
        };

        // Validate required fields
        if (!formattedData.items || isNaN(formattedData.totalPrice)) {
          console.error("Webhook Error: Invalid formatted data", {
            hasItems: !!formattedData.items,
            totalPrice: formattedData.totalPrice
          });
          return res.status(400).json({ error: "Invalid order data" });
        }

        await handleOrderCreation({ body: formattedData }, res);
        return; // Exit early to prevent duplicate response
      } catch (err) {
        console.error("Error processing checkout.session.completed event:", err);
        return res.status(500).json({
          error: "Error processing payment webhook",
          message: err.message
        });
      }

    //Event when payment failed due to card problem or insufficient funds
    case "payment_intent.payment_failed":
      console.log("Payment failed");
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  // Return a res to acknowledge receipt of the event
  res.json();
};
