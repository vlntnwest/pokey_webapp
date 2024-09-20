const net = require("net");
const EscPosEncoder = require("esc-pos-encoder");

// Fonction pour créer un nouveau client d'imprimante
const createPrinterClient = () => {
  console.log("[🧾 THERMAL] Creating new socket...");
  const client = new net.Socket();

  // Gestion des événements de socket
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

const printText = (text) => {
  return new Promise((resolve, reject) => {
    const client = createPrinterClient();

    client.connect(process.env.PRINTER_PORT, process.env.PRINTER_HOST, () => {
      console.log("[🧾 THERMAL] Connected to printer");

      try {
        const encoder = new EscPosEncoder();
        const printData = encoder
          .initialize()
          .newline()
          .size("normal")
          .text(text)
          .newline()
          .cut()
          .encode();

        client.write(Buffer.from(printData), () => {
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
