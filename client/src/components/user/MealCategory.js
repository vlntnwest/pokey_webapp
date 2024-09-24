import { Box, Typography } from "@mui/material";
import React from "react";
import CategoryMealCard from "./Card/CategoryMealCard";
import { useSelector } from "react-redux";
import { isEmpty } from "../Utils";

const MealCategory = ({ type }) => {
  const mealsData = useSelector((state) => state.mealReducer);
  const detailsData = useSelector((state) => state.detailsReducer);

  const sortedMeals = !isEmpty(mealsData)
    ? mealsData.filter((meal) => meal.type === type)
    : [];

  const sortedDetails = !isEmpty(detailsData)
    ? detailsData.filter((detail) => detail.type === type)
    : [];

  const details =
    sortedDetails.length > 0
      ? sortedDetails[0]
      : {
          title: "Titre non trouvé",
          description: "Description non trouvée.",
        };

  return (
    <Box mt={3}>
      <Box m={2} mt={0}>
        <Typography variant="h2">{details.title}</Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: 16, color: "text.secondary" }}
        >
          {details.description}
        </Typography>
      </Box>
      <Box>
        {sortedMeals.map((meal, index) => (
          <CategoryMealCard key={index} meal={meal} />
        ))}
      </Box>
    </Box>
  );
};

export default MealCategory;
