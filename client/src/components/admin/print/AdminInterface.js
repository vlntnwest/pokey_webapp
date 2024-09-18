import { Card, CardContent } from "@mui/material";
import React, { useEffect, useState } from "react";

// Fonction pour envoyer les données à l'imprimante via TCP/IP
const sendToPrinter = async (printerIP, printerPort, order) => {
  const socket = new WebSocket(`ws://${printerIP}:${printerPort}`); // Connexion WebSocket à l'imprimante réseau

  socket.onopen = () => {
    socket.send(order); // Envoie les commandes ESC/POS sous forme de données binaires
    socket.close(); // Ferme la connexion après l'envoi
  };

  socket.onerror = (error) => {
    console.error("Erreur de connexion à l'imprimante :", error);
  };
};

const AdminInterface = () => {
  const [printerIP, setPrinterIP] = useState("192.168.192.50"); // IP de l'imprimante locale
  const [printerPort, setPrinterPort] = useState(9100); // Port TCP de l'imprimante

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // Connexion WebSocket avec le serveur backend

    ws.onmessage = (event) => {
      const data = event.data;
      console.log("Données reçues du WebSocket :", data);

      // Vous pouvez ensuite envoyer les détails à l'imprimante ici via TCP
      sendToPrinter(printerIP, printerPort, data);
    };

    ws.onerror = (error) => {
      console.error("Erreur de connexion au WebSocket :", error);
    };

    return () => ws.close(); // Ferme la connexion WebSocket lors du démontage du composant
  }, [printerIP, printerPort]);

  return (
    <Card>
      <CardContent>
        <div>
          <h1>Interface Admin - Impression des commandes</h1>

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
      </CardContent>
    </Card>
  );
};

export default AdminInterface;
