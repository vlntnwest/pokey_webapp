import { Box, Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const CartValidator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tableNumber } = useParams();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Récupérer les données du sessionStorage
    const cartData = JSON.parse(sessionStorage.getItem("Cart"));

    if (!cartData) {
      console.error("Aucune donnée dans le sessionStorage");
      setIsSubmitting(false);
      return;
    }

    const items = cartData.map((item) => {
      const meal = {
        type: item.type,
        name: item.name,
        base: item.base,
        proteins: item.proteins,
        extraProteins: item.extraProtein,
        garnishes: item.garnishes,
        toppings: item.toppings,
        sauces: item.sauces,
        quantity: item.quantity,
      };
      return meal;
    });

    const dataToPrint = {
      tableNumber,
      items: items,
    };

    console.log(dataToPrint);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/order`,
        dataToPrint
      );
      console.log("Commande créée avec succès:", response.data);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des données à l'API:",
        error.response?.data || error.message
      );
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/order/print-order`,
        { orderData: dataToPrint }
      );
      console.log("Commande envoyée avec succès:", response.data);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des données à l'API:",
        error.response?.data || error.message
      );
    }

    setIsSubmitting(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        backgroundColor: "#fff",
        p: 2,
        filter: "drop-shadow(0 1px 4px rgba(0, 0, 0, .08))",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          pb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="textPrimary">
            Total de la commande
          </Typography>
        </Box>
        <Box>
          <Typography color="textPrimary">32,90€</Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        fullWidth
        sx={{ py: 1.5 }}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <CircularProgress color="secondary" size={24.5} />
        ) : (
          "Finaliser la commande"
        )}
      </Button>
    </Box>
  );
};

export default CartValidator;
