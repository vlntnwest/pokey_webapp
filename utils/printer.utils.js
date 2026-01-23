const net = require("net");
const EscPosEncoder = require("esc-pos-encoder");
const { log } = require("console");

// Canvas is optional - only needed for printImage function
let createCanvas, loadImage;
try {
  const canvas = require("canvas");
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (err) {
  console.warn("[🧾 THERMAL] Canvas module not available - printImage will not work");
}

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
        const encoder = new EscPosEncoder();

        let printData = encoder
          .initialize()
          .codepage("cp850")
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

module.exports.printImage = (image) => {
  return new Promise(async (resolve, reject) => {
    // Check if canvas is available
    if (!createCanvas || !loadImage) {
      console.error("[🧾 THERMAL] Canvas module not available");
      return reject({
        status: "error",
        message: "Image printing not available - canvas module not installed"
      });
    }

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
