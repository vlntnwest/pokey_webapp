import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/user/Header";
import { useDispatch, useSelector } from "react-redux";
import { getTable } from "../actions/table.action";
import { Alert, Container } from "@mui/material";

const Table = () => {
  const dispatch = useDispatch();
  const { tableNumber } = useParams();
  const tableData = useSelector((state) => state.tableReducer);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getTable(tableNumber));
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
  console.log(isTableOpen);

  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
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

  return <Header />;
};

export default Table;
