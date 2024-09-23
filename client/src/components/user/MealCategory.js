import { Box, Typography } from "@mui/material";
import React from "react";
import CategoryMealCard from "./Card/CategoryMealCard";

const MealCategory = () => {
  return (
    <Box mt={3}>
      <Box m={2} mt={0}>
        <Typography variant="h2">Bowls Signatures</Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: 16, color: "text.secondary" }}
        >
          Pokeybowls 100% frais et faits avec amour
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          py: 1,
          overflow: "auto",
          width: "100%",
          scrollSnapType: "x mandatory",
          "& > *": {
            scrollSnapAlign: "center",
          },
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        <CategoryMealCard />
      </Box>
    </Box>
  );
};

export default MealCategory;
