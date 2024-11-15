const net = require("net");
const EscPosEncoder = require("esc-pos-encoder");
const { createCanvas, loadImage } = require("canvas");

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

      try {
        const encoder = new EscPosEncoder();

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

          // Vérifiez si 'proteins' est défini et est un tableau
          if (item.proteins) {
            printData.text(`Proteins: ${item.proteins}\n`);
          }

          // Vérifiez si 'garnishes' est défini et est un tableau
          if (Array.isArray(item.garnishes) && item.garnishes.length > 0) {
            printData.text(`Garnishes: ${item.garnishes.join(", ")}\n`);
          }

          // Vérifiez si 'toppings' est défini et est un tableau
          if (Array.isArray(item.toppings) && item.toppings.length > 0) {
            printData.text(`Toppings: ${item.toppings.join(", ")}\n`);
          }

          // Vérifiez si 'sauces' est défini et est un tableau
          if (Array.isArray(item.sauces) && item.sauces.length > 0) {
            printData.text(`Sauces: ${item.sauces.join(", ")}\n`);
          }

          if (
            Array.isArray(item.extraProteins) &&
            item.extraProteins.length > 0
          ) {
            printData.text(
              `Extra proteins: ${item.extraProteins.join(", ")}\n`
            );
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

module.exports.printImage = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Decode the base64 image into a buffer
      const base64Data = image.split(",")[1];

      // Load the image using the canvas library
      const img = await loadImage(`data:image/png;base64,${base64Data}`);

      // Create a canvas and draw the image onto it
      const canvas = createCanvas(64, 64); // Adjust the size as needed
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 64, 64);

      // Initialize the ESC/POS encoder
      const encoder = new EscPosEncoder();

      // Encode the image for the ESC/POS printer
      const encodedImage = encoder
        .initialize()
        .align("center")
        .image(canvas, 512, 512, "floydsteinberg")
        .encode();

      // Send the encoded image to the printer via socket
      const client = new net.Socket();
      client.connect(process.env.PRINTER_PORT, process.env.PRINTER_HOST, () => {
        console.log("[🧾 THERMAL] Connected to the printer");

        client.write(encodedImage, () => {
          console.log("[🧾 THERMAL] Image sent to the printer");
          client.end();
          resolve({ status: "success", message: "Image printed successfully" });
        });
      });

      client.on("error", (err) => {
        console.error("[🧾 THERMAL] Error connecting to printer:", err);
        client.end();
        reject({ status: "error", message: err.message });
      });
    } catch (err) {
      console.error("[🧾 THERMAL] Error processing the image:", err);
      reject({ status: "error", message: "Error processing the image" });
    }
  });
};
