import { Box, Card, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RecapLine from "./RecapLine";

const CartSummary = () => {
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const storedCartData = sessionStorage.getItem("Cart");
    if (storedCartData) {
      try {
        const parsedData = JSON.parse(storedCartData);
        setCartData(parsedData);
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
  }, []);

  const updateItemCount = (itemName, newCount) => {
    const updatedCart = cartData.map((item) =>
      item.name === itemName ? { ...item, count: newCount } : item
    );
    setCartData(updatedCart);
    sessionStorage.setItem("Cart", JSON.stringify(updatedCart));
  };

  return (
    <Box
      px={2}
      pt={2}
      sx={{ flexGrow: "1", backgroundColor: "rgba(208, 208, 208, 0.12)" }}
    >
      <Typography variant="h2" fontSize={18} pt={1} pb={2} color="textPrimary">
        Panier
      </Typography>
      <Card>
        {cartData.map((item, index) => (
          <RecapLine
            key={index}
            item={item}
            updateItemCount={updateItemCount}
          />
        ))}
      </Card>
    </Box>
  );
};

export default CartSummary;
