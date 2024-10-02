import { Box, Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useShoppingCart } from "../../Context/ShoppingCartContext";

const CartValidator = ({ setOpen }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tableNumber } = useParams();
  const { cartItems, clearCart } = useShoppingCart();

  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => {
        const price = parseFloat(item.price.replace(",", "."));
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!cartItems.length) {
      // Vérifier si le panier est vide
      console.error("Aucune donnée dans le panier");
      setIsSubmitting(false);
      return;
    }

    const items = cartItems.map((item) => {
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
    clearCart();
    setOpen(false);
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
          <Typography color="textPrimary">
            {calculateTotalPrice().replace(".", ",")}€
          </Typography>
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
