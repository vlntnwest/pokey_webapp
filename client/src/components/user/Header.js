import React, { useState } from "react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import BottomDrawer from "./Modal/BottomDrawer";
import Cart from "./Cart/Cart";
import { useShoppingCart } from "../Context/ShoppingCartContext";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { cartItems } = useShoppingCart();

  return (
    <Box
      style={{
        position: "sticky",
        top: "0",
        borderBottom: "1px solid rgba(0,0,0,.08)",
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
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <div
              style={{
                width: "100px",
                backgroundImage:
                  "url('https://g10afdaataaj4tkl.public.blob.vercel-storage.com/img/1Fichier-21.svg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                textIndent: "-9999px",
              }}
            >
              Pokey bar
            </div>
          </Box>
          {cartItems.length > 0 ? (
            <IconButton onClick={() => setOpen(true)}>
              <ShoppingBagOutlinedIcon />
            </IconButton>
          ) : null}
          <BottomDrawer open={open} setOpen={setOpen}>
            <Cart setOpen={setOpen} />
          </BottomDrawer>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
