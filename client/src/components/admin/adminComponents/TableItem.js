import React, { useState } from "react";
import { Switch, Typography, Box } from "@mui/material";
import axios from "axios";

const TableItem = ({ table }) => {
  const { tableNumber, isOpen, _id } = table;

  const [open, setOpen] = useState(isOpen);

  const handleOnChange = async () => {
    setOpen(!open);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}api/table/${_id}/toggle`
      );
    } catch (error) {
      console.error("Error while changing the state", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "50%",
      }}
    >
      <Typography variant="h6">Table {tableNumber}</Typography>
      <Switch
        checked={open}
        onChange={handleOnChange}
        inputProps={{ "aria-label": `Table ${tableNumber}` }}
      />
    </Box>
  );
};

export default TableItem;
