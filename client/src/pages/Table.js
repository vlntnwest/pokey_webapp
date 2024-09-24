import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/user/Header";
import { useDispatch, useSelector } from "react-redux";
import { getTable } from "../actions/table.action";
import { getDetails } from "../actions/details.action";
import { Alert, Box, Container } from "@mui/material";
import Popular from "../components/user/Popular";
import MealCategory from "../components/user/MealCategory";
import { getMeals } from "../actions/meal.action";

const Table = () => {
  const dispatch = useDispatch();
  const { tableNumber } = useParams();
  const tableData = useSelector((state) => state.tableReducer);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const types = ["bowl", "custom", "side", "dessert", "drink"];

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getTable(tableNumber));
        await dispatch(getMeals());
        await dispatch(getDetails());
      } catch (error) {
        setError(
          error.response
            ? error.response.data.error
            : "Error fetching tables data"
        );
      }
    };

    fetchData();
  }, [dispatch, tableNumber]);

  useEffect(() => {
    setIsTableOpen(tableData.isOpen);
  }, [tableData]);

  if (error) {
    return (
      <Container sx={{ alignContent: "center", height: "100vh" }}>
        <img src="../img/1Fichier-21.svg" alt="" style={{ width: "100%" }} />
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  if (isTableOpen === false)
    return (
      <Container sx={{ alignContent: "center", height: "100vh" }}>
        <img src="../img/1Fichier-21.svg" alt="" style={{ width: "100%" }} />
        <Alert severity="info">
          La table est fermé, demandez à Flo de l'ouvrir
        </Alert>
      </Container>
    );

  return (
    <Box
      style={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-msOverflowStyle": "none",
        scrollbarWidth: "none",
      }}
    >
      <Header />
      <Box component="main">
        <Popular />
        {types.map((type, index) => (
          <MealCategory type={type} key={index} />
        ))}
      </Box>
    </Box>
  );
};

export default Table;
