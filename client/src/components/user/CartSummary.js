import { Box, Card, Typography } from "@mui/material";
import React from "react";
import RecapLine from "./RecapLine";

const CartSummary = () => {
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
        <RecapLine />
      </Card>
    </Box>
  );
};

export default CartSummary;
