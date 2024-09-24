import { Box, Typography } from "@mui/material";
import React from "react";
import PopularCard from "./Card/PopularCard";
import { useSelector } from "react-redux";
import { isEmpty } from "../Utils";

const Popular = () => {
  const mealsData = useSelector((state) => state.mealReducer);

  const popularMeal = !isEmpty(mealsData)
    ? mealsData.filter((meal) => meal.isPopular === true)
    : [];

  return (
    <Box>
      <Typography variant="h2" m={2}>
        Populaire
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          pl: 2,
          pr: 2,
          overflow: "auto",
          width: "100%",
          scrollSnapType: "x mandatory",
          "& > *": {
            scrollSnapAlign: "center",
          },
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        {popularMeal.map((meal, index) => (
          <PopularCard key={index} meal={meal} />
        ))}
      </Box>
    </Box>
  );
};

export default Popular;
