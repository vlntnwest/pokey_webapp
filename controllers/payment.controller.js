module.exports.createCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "custom",
    // The URL of your payment completion page
    return_url: "{{RETURN_URL}}",
  });

  res.json({ checkoutSessionClientSecret: session.client_secret });
};
