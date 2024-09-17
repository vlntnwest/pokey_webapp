import React, { useEffect, useState } from "react";

// Fonction pour envoyer les données à l'imprimante via TCP/IP
const sendToPrinter = async (printerIP, printerPort, escposData) => {
  const socket = new WebSocket(`ws://${printerIP}:${printerPort}`); // Connexion WebSocket à l'imprimante réseau

  socket.onopen = () => {
    socket.send(escposData); // Envoie les commandes ESC/POS
    socket.close(); // Ferme la connexion
  };

  socket.onerror = (error) => {
    console.error("Erreur de connexion à l'imprimante :", error);
  };
};

const AdminInterface = () => {
  const [status, setStatus] = useState("Idle");
  const [printerIP, setPrinterIP] = useState("192.168.1.100"); // IP de l'imprimante locale
  const [printerPort, setPrinterPort] = useState(9100); // Port TCP de l'imprimante

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // Connexion WebSocket avec le serveur backend

    ws.onmessage = (event) => {
      const escposData = event.data; // Données ESC/POS reçues du serveur backend (encodées en base64)
      const decodedData = Buffer.from(escposData, "base64"); // Décoder les données en buffer

      // Envoie les données à l'imprimante via TCP
      sendToPrinter(printerIP, printerPort, decodedData);

      setStatus("Printing...");
    };

    ws.onerror = (error) => {
      console.error("Erreur de connexion au WebSocket :", error);
    };

    return () => ws.close(); // Ferme la connexion WebSocket lors du démontage du composant
  }, [printerIP, printerPort]);

  return (
    <div>
      <h1>Interface Admin - Impression des commandes</h1>
      <p>Status: {status}</p>

      {/* Champs pour configurer l'IP et le port de l'imprimante */}
      <label>
        IP de l'imprimante :
        <input
          type="text"
          value={printerIP}
          onChange={(e) => setPrinterIP(e.target.value)}
        />
      </label>
      <br />
      <label>
        Port de l'imprimante :
        <input
          type="number"
          value={printerPort}
          onChange={(e) => setPrinterPort(Number(e.target.value))}
        />
      </label>
    </div>
  );
};

export default AdminInterface;
