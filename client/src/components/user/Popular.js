import { Alert, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import PopularCard from "./Card/PopularCard";
import { useDispatch, useSelector } from "react-redux";
import { getMeals } from "../../actions/meal.action";
import { isEmpty } from "../Utils";

const Popular = () => {
  const mealsData = useSelector((state) => state.mealReducer);
  const dispatch = useDispatch();
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getMeals());
      } catch (error) {
        setError(
          error.response
            ? error.response.data.error
            : "Error fetching tables data"
        );
      }
    };

    fetchData();
  }, [dispatch]);

  const popularMeal = !isEmpty(mealsData)
    ? mealsData.filter((meal) => meal.__v === 0)
    : [];

  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h2" m={2} mt={0}>
        Populaire
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          ml: 2,
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
