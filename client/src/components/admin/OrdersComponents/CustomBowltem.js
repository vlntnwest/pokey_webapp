import React from "react";
import { Typography } from "@mui/material";

const CustomBowlItem = ({
  name,
  quantity,
  base,
  proteins,
  garnishes,
  toppings,
  sauces,
  extraProtein,
}) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">
        Base: {base}
        <br />
        Proteins: {proteins}
        <br />
        Garnishes: {garnishes.join(", ")}
        <br />
        Toppings: {toppings.join(", ")}
        <br />
        Sauces: {sauces.join(", ")}
        <br />
        Extra Protein:{" "}
        {extraProtein
          ? `${extraProtein.name} x${extraProtein.quantity}`
          : "None"}
      </Typography>
    </>
  );
};
export default CustomBowlItem;
