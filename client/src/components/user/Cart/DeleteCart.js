import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useShoppingCart } from "../../Context/ShoppingCartContext";

const DeleteCart = ({ toggleDrawer }) => {
  const { clearCart } = useShoppingCart();

  const deleteCart = () => {
    clearCart();
    toggleDrawer(false)();
  };

  return (
    <Box>
      <Box
        style={{
          position: "sticky",
          top: "0",
          borderBottom: "1px solid #0000000a",
          zIndex: 10,
        }}
      >
        <AppBar
          component="nav"
          style={{
            background: "#fff",
            boxShadow: "none",
            position: "sticky",
            top: "0",
          }}
        >
          <Toolbar style={{ padding: "0 8px" }}>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Box px={2} py={4}>
        <Typography variant="body2" textAlign={"center"}>
          Souhaitez vous vraiment supprimer l'ensemble du panier?
        </Typography>
      </Box>
      <Box>
        <Box sx={{ px: 2, pb: 1 }}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ py: 1.5 }}
            onClick={deleteCart}
          >
            Retirer tous les produits
          </Button>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.5 }}
            onClick={toggleDrawer(false)}
          >
            Annuler
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DeleteCart;
