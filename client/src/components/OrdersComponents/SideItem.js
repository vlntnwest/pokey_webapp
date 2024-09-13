import React from "react";
import { Typography } from "@mui/material";

const SideItem = ({ name, quantity, sauces }) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">Sauces: {sauces.join(", ")}</Typography>
    </>
  );
};

export default SideItem;
