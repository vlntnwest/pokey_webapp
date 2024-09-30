import { Box, Button, Divider, Drawer, Typography } from "@mui/material";
import React, { useState } from "react";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import EditCartItems from "./EditCartItems";

const RecapLine = ({ item, updateItemCount }) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const calculateTotalPrice = () => {
    let totalPrice = parseFloat(item.price.replace(",", "."));

    totalPrice *= item.quantity;

    return totalPrice.toFixed(2);
  };

  return (
    <>
      <Button
        color="secondary"
        disableElevation
        fullWidth
        sx={{
          p: 0,
          display: "block",
        }}
        onClick={toggleDrawer(true)}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ mr: 1.5, pl: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: "400", textTransform: "lowercase" }}>
              {item.quantity}x
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              pl: 1.5,
              pr: 2,
              mr: "auto",
              alignItems: "flex-start",
            }}
          >
            <Typography sx={{ textAlign: "left", fontWeight: "400" }}>
              {item.name}
            </Typography>
          </Box>
          <Box sx={{ ml: 1.5 }}>
            <Box sx={{ display: "flex", px: 2, py: 1.5, alignItems: "center" }}>
              <Typography sx={{ fontWeight: "400" }}>
                {calculateTotalPrice().replace(".", ",")}€
              </Typography>
              <ArrowForwardIosRoundedIcon sx={{ ml: 1, maxHeight: "21px" }} />
            </Box>
          </Box>
        </Box>
      </Button>
      <Divider variant="middle" sx={{ borderColor: "#0000000a" }} />
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="bottom">
        <EditCartItems
          toggleDrawer={toggleDrawer}
          item={item}
          updateItemCount={updateItemCount}
        />
      </Drawer>
    </>
  );
};

export default RecapLine;
