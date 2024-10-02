import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import React, { useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteCart from "./DeleteCart";
import { useShoppingCart } from "../../Context/ShoppingCartContext";

const CartHeader = ({ setOpen }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { cartItems } = useShoppingCart();

  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  return (
    <>
      <Box
        style={{
          position: "sticky",
          top: "0",
          filter: "drop-shadow(0 1px 4px rgba(0, 0, 0, .08))",
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
            <IconButton onClick={() => setOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
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
              <IconButton onClick={() => setOpenDrawer(true)}>
                <DeleteOutlineRoundedIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => setOpenDrawer(true)} disabled>
                <DeleteOutlineRoundedIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer open={openDrawer} onClose={toggleDrawer(false)} anchor="bottom">
        <DeleteCart toggleDrawer={toggleDrawer} />
      </Drawer>
    </>
  );
};

export default CartHeader;
