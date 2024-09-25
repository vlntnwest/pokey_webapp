import React from "react";
import { Box, CardMedia, Typography, Divider } from "@mui/material";
import FormRenderer from "./Form/FormRenderer";

const MealDisplay = ({ meal, options, handlers }) => {
  const { name, picture, description, type } = meal;
  return (
    <Box sx={{ flexGrow: "1", overflowY: "auto", overflowX: "hidden" }}>
      <CardMedia
        component="img"
        image={`/img/${picture}.webp`}
        alt={name}
        sx={{ height: "40%" }}
      />
      <Box p={2}>
        <Typography variant="h3" sx={{ fontSize: 26 }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 16, mt: 1 }}>
          {description}
        </Typography>
        <Divider sx={{ mt: 2 }} />
        <FormRenderer type={type} options={options} handlers={handlers} />
      </Box>
    </Box>
  );
};

export default MealDisplay;
