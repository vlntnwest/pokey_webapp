import React from "react";
import { Typography } from "@mui/material";

const DessertItem = ({ name, quantity }) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
    </>
  );
};

export default DessertItem;
