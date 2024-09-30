import React from "react";
import { Box, Typography } from "@mui/material";

const DrinkItem = ({ name, quantity }) => {
  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6">
        {name} x{quantity}
      </Typography>
    </Box>
  );
};

export default DrinkItem;
