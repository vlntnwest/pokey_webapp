import React, { useState } from "react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import BottomDrawer from "./Modal/BottomDrawer";

const Header = () => {
  const [open, setOpen] = useState(false);

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
                backgroundImage: "url(../img/1Fichier-21.svg)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                textIndent: "-9999px",
              }}
            >
              Pokey bar
            </div>
          </Box>
          <IconButton onClick={() => setOpen(true)}>
            <ShoppingBagOutlinedIcon />
          </IconButton>
          <BottomDrawer open={open} setOpen={setOpen}></BottomDrawer>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
