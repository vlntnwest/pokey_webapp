import React from "react";
import { Typography } from "@mui/material";

const BowlItem = ({ name, quantity, base, garnishes, toppings, sauces }) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">
        Base: {base}
        <br />
        Sauces: {sauces.join(", ")}
      </Typography>{" "}
    </>
  );
};

export default BowlItem;
