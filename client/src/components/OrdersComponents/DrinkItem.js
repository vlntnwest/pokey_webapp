import React from "react";
import { Typography } from "@mui/material";

const DrinkItem = ({ name, quantity, size }) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">Size: {size}</Typography>
    </>
  );
};

export default DrinkItem;
