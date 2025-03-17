require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia; custom_checkout_beta=v1;",
});

module.exports.createCheckoutSession = async (req, res) => {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    mode: "payment",
    payment_method_types: ["card"],
    ui_mode: "custom",
    // The URL of your payment completion page
    return_url: process.env.CLIENT_URL,
  });

  res.json({ checkoutSessionClientSecret: session.client_secret });
};
