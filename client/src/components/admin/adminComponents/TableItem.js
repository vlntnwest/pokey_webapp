import React, { useState } from "react";
import { Switch, Typography, TableRow, TableCell } from "@mui/material";
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
    <TableRow>
      <TableCell>
        <Typography>Table {tableNumber}</Typography>
      </TableCell>
      <TableCell width={1}>
        <Switch
          checked={open}
          onChange={handleOnChange}
          inputProps={{ "aria-label": `Table ${tableNumber}` }}
        />
      </TableCell>
    </TableRow>
  );
};

export default TableItem;
