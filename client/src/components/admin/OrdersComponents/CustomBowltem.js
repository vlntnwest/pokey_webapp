import React from "react";
import { Box, Typography } from "@mui/material";

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
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
      <Typography variant="body1">Base:</Typography>
      <Typography variant="body2">{base}</Typography>
      <Typography variant="body1">Protéine:</Typography>
      <Typography variant="body2">{proteins}</Typography>
      <Typography variant="body1">Accompagnements:</Typography>
      <Typography variant="body2">{garnishes.join(", ")}</Typography>
      <Typography variant="body1">Toppings:</Typography>
      <Typography variant="body2">{toppings.join(", ")}</Typography>
      <Typography variant="body1">Sauces:</Typography>
      <Typography variant="body2">{sauces.join(", ")}</Typography>
      {extraProteins ? (
        <>
          <Typography variant="body1">Extra Proteine</Typography>
          <Typography variant="body2">{extraProteins.join(", ")}</Typography>
        </>
      ) : null}
    </Box>
  );
};
export default CustomBowlItem;
