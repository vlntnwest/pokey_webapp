import React from "react";
import { Typography } from "@mui/material";

const BowlItem = ({ name, quantity, base, sauces, extraProteins }) => {
  return (
    <>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">
        Base: {base}
        <br />
        Sauces: {sauces.join(", ")}
        <br />
        {extraProteins ? `Extra Proteine : ${extraProteins.join(", ")}` : null}
      </Typography>{" "}
    </>
  );
};

export default BowlItem;
