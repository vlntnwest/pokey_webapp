const net = require("net");
const EscPosEncoder = require("esc-pos-encoder");

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

const printText = (orderData) => {
  return new Promise((resolve, reject) => {
    const client = createPrinterClient();

    client.connect(process.env.PRINTER_PORT, process.env.PRINTER_HOST, () => {
      console.log("[🧾 THERMAL] Connected to printer");

      try {
        const encoder = new EscPosEncoder();
        // Construire l'ordre d'impression
        let printData = encoder
          .initialize()
          .codepage("cp850")
          .newline()
          .text("Mon Restaurant\n")
          .text(`Table: ${orderData.tableNumber}\n`)
          .newline()
          .text("------------------------------\n");

        orderData.items.forEach((item) => {
          printData.text(`${item.name} x${item.quantity}\n`);

          if (item.base) {
            printData.text(`Base: ${item.base}\n`);
          }

          if (item.proteins) {
            printData.text(`Proteins: ${item.proteins}\n`);
          }

          if (item.garnishes && item.garnishes.length > 0) {
            printData.text(`Garnishes: ${item.garnishes.join(", ")}\n`);
          }

          if (item.toppings && item.toppings.length > 0) {
            printData.text(`Toppings: ${item.toppings.join(", ")}\n`);
          }

          if (item.sauces && item.sauces.length > 0) {
            printData.text(`Sauces: ${item.sauces.join(", ")}\n`);
          }

          if (item.extraProtein) {
            printData.text(
              `Extra Protein: ${item.extraProtein.name} x${item.extraProtein.quantity}\n`
            );
          }

          printData.newline();
        });

        printData
          .text("------------------------------\n")
          .text("Comments\n")
          .text(`${orderData.specialInstructions}\n`)
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

module.exports = {
  createPrinterClient,
  printText,
};
