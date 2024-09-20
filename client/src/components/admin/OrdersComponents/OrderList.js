import {
  Box,
  Button,
  IconButton,
  Modal,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import React, { useState } from "react";
import OrderCard from "./OrderCard";
import { useDispatch } from "react-redux";
import { toggleArchive } from "../../../actions/order.action";

const OrderList = ({ order }) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: 24,
  };

  const { isArchived, tableNumber, _id } = order;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [archived, setArchived] = useState(isArchived);
  const dispatch = useDispatch();

  const handleOnChange = async () => {
    try {
      setArchived(!archived);
      dispatch(toggleArchive({ id: _id, isArchived: !archived }));
      handleClose();
    } catch (error) {
      console.error("Error while changing the state", error);
    }
  };

  if (archived === true)
    return (
      <>
        <TableRow>
          <TableCell component="th" scope="row">
            <Button variant="text" onClick={handleOpen}>
              <Typography>Table: {tableNumber}</Typography>
            </Button>
          </TableCell>
          <TableCell width={1}>
            <IconButton aria-label="print">
              <PrintIcon />
            </IconButton>
          </TableCell>
          <TableCell width={1}>
            <IconButton aria-label="unarchive" onClick={handleOnChange}>
              <UnarchiveIcon />
            </IconButton>
          </TableCell>
        </TableRow>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box style={modalStyle}>
            <OrderCard
              order={order}
              modal={true}
              handleOnChange={handleOnChange}
            />
          </Box>
        </Modal>
      </>
    );
};

export default OrderList;
