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
  extraProteins,
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
        {extraProteins ? `Extra Proteine : ${extraProteins.join(", ")}` : null}
      </Typography>
    </>
  );
};
export default CustomBowlItem;
