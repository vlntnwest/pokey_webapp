import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";

const CartValidator = ({ isLoading }) => {
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
      <Button variant="contained" fullWidth sx={{ py: 1.5 }}>
        {isLoading ? (
          <CircularProgress color="secondary" size={24.5} />
        ) : (
          "Finaliser la commande"
        )}
      </Button>
    </Box>
  );
};

export default CartValidator;
