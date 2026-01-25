const net = require("net");
const ReceiptPrinterEncoder = require("@point-of-sale/receipt-printer-encoder");

const createPrinterClient = () => {
  console.log("[🧾 THERMAL] Creating new socket...");
  const client = new net.Socket();

  client.on("data", (data) => {
    console.log("[🧾 THERMAL] Received:", data.toString("hex"));
  });

  client.on("error", (err) => {
    console.error("[🧾 THERMAL] Error connecting to printer:", err);
  });

  client.on("close", () => {
    console.log("[🧾 THERMAL] Disconnected from printer");
  });

  return client;
};

module.exports.printText = (orderData) => {
  return new Promise((resolve, reject) => {
    const client = createPrinterClient();

    client.connect(process.env.PRINTER_PORT, process.env.PRINTER_HOST, () => {
      console.log("[🧾 THERMAL] Connected to printer");
      const now = new Date();
      const time = now.toLocaleString("fr-FR", {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      try {
        const encoder = new ReceiptPrinterEncoder({
          language: "esc-pos",
          codepageMapping: "epson",
        });

        let printData = encoder
          .initialize()
          .codepage("cp437")
          .newline()
          .text("Pokey Bar\n");
        if (orderData.orderType === "clickandcollect") {
          printData.text(`Click and Collect\n`);
          printData.text(`${orderData.orderNumber}\n`);
          printData.text(
            `Date: ${orderData.orderDate.date} à ${orderData.orderDate.time}\n`
          );
          if (orderData.isSuccess) {
            printData.text(`Payé\n`);
          }
        } else {
          printData.text(`Table: ${orderData.tableNumber}\n`);
          printData.text(`${time}\n`);
        }
        printData.newline().text("------------------------------\n").newline();

        orderData.items.forEach((item) => {
          printData.text(`${item.name} x${item.quantity}\n`);

          if (item.base) {
            printData.text(`Base: ${item.base}\n`);
          }
          if (Array.isArray(item.proteins) && item.proteins.length > 0) {
            printData.text(`Proteins: ${item.proteins.join(", ")}\n`);
          }
          if (
            Array.isArray(item.extraProtein) &&
            item.extraProtein.length > 0
          ) {
            printData.text(`Extra proteins: ${item.extraProtein.join(", ")}\n`);
          }

          if (Array.isArray(item.garnishes) && item.garnishes.length > 0) {
            printData.text(`Garnishes: ${item.garnishes.join(", ")}\n`);
          }

          if (Array.isArray(item.toppings) && item.toppings.length > 0) {
            printData.text(`Toppings: ${item.toppings.join(", ")}\n`);
          }

          if (Array.isArray(item.sauces) && item.sauces.length > 0) {
            printData.text(`Sauces: ${item.sauces.join(", ")}\n`);
          }

          printData.newline();
        });

        if (
          orderData.specialInstructions &&
          orderData.specialInstructions.trim() !== ""
        ) {
          printData.text("------------------------------\n").text("Comments\n");
          printData.text(`${orderData.specialInstructions}\n`);
        }

        if (orderData.clientData?.name || orderData.clientData?.phone) {
          printData.text("------------------------------\n");
          printData.text(`${orderData.clientData.name}\n`);
          printData.text(`${orderData.clientData.phone}\n`);
        }

        printData
          .text("------------------------------\n")
          .newline()
          .newline()
          .newline()
          .newline()
          .cut();

        const encodedData = printData.encode();

        client.write(Buffer.from(encodedData), () => {
          console.log("[🧾 THERMAL] Sent data to printer");
          client.end();
          resolve("Printed successfully");
        });
      } catch (encodeError) {
        console.error("[🧾 THERMAL] Encoding error:", encodeError);
        client.end();
        reject("Error encoding print data");
      }
    });

    client.on("error", (err) => {
      console.error("[🧾 THERMAL] Error connecting to printer:", err);
      client.end();
      reject("Error connecting to printer");
    });
  });
};
