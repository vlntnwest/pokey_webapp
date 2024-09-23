import React from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import CartModal from "./Modal/CartModal";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

const Header = () => {
  return (
    <Box
      style={{
        position: "sticky",
        top: "0",
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
                backgroundImage: "url(../img/1Fichier-21.svg)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                textIndent: "-9999px",
              }}
            >
              Pokey bar
            </div>
          </Box>
          <CartModal btnTxt={<ShoppingBagOutlinedIcon />} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
