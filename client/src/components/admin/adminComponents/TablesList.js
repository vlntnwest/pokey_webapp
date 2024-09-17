import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UidContext } from "../../AppContext";
import { getTables } from "../../../actions/table.action";
import { Alert, Box } from "@mui/material";
import TableItem from "./TableItem";

const TablesList = () => {
  const dispatch = useDispatch();
  const uid = useContext(UidContext);

  const tablesData = useSelector((state) => state.tableReducer);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getTables());
      } catch (error) {
        setError(
          error.response
            ? error.response.data.error
            : "Error fetching tables data"
        );
      }
    };

    fetchData();
  }, [dispatch, uid]);

  if (error) {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  const sortedTables = Array.isArray(tablesData)
    ? [...tablesData].sort((a, b) => a.tableNumber - b.tableNumber)
    : [];
  return (
    <Box>
      {sortedTables.map((table, index) => (
        <TableItem key={index} table={table} />
      ))}
    </Box>
  );
};

export default TablesList;