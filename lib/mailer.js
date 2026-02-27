const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const logger = require("../logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templatePath = path.join(__dirname, "../Template/emailTemplate.html");
const emailTemplate = fs.readFileSync(templatePath, "utf8");

function renderTemplate(data) {
  return emailTemplate
    .replace(/\{\{orderNumber\}\}/g, data.orderNumber)
    .replace(/\{\{clientName\}\}/g, data.clientName)
    .replace(/\{\{orderDate\}\}/g, data.orderDate)
    .replace(/\{\{orderTime\}\}/g, data.orderTime)
    .replace(/\{\{totalPrice\}\}/g, data.totalPrice)
    .replace(/\{\{orderlink\}\}/g, data.orderLink);
}

/**
 * Send order confirmation email to client.
 * Fire-and-forget: errors are logged but do not throw.
 */
async function sendOrderConfirmation({ to, order }) {
  if (!to) return;

  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const html = renderTemplate({
    orderNumber: order.id.slice(0, 8).toUpperCase(),
    clientName: order.fullName || "Client",
    orderDate: createdAt.toLocaleDateString("fr-FR"),
    orderTime: createdAt.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    totalPrice: `${parseFloat(order.totalPrice).toFixed(2)} €`,
    orderLink: `${process.env.CLIENT_URL}/order/${order.id}`,
  });

  try {
    await transporter.sendMail({
      from: `"Pokey" <${process.env.SMTP_USER}>`,
      to,
      subject: `Confirmation de commande #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
    logger.info({ orderId: order.id, to }, "Order confirmation email sent");
  } catch (err) {
    logger.error(
      { orderId: order.id, to, error: err.message },
      "Failed to send order confirmation email",
    );
  }
}

module.exports = { sendOrderConfirmation };
