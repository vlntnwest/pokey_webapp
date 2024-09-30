import {
  Box,
  Button,
  CircularProgress,
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
import axios from "axios";

const OrderList = ({ order }) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: 24,
  };

  const { isArchived, tableNumber, _id, createdAt } = order;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [archived, setArchived] = useState(isArchived);
  const dispatch = useDispatch();
  const date = new Date(createdAt);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderDate = () => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    if (dt < 10) {
      dt = "0" + dt;
    }
    if (month < 10) {
      month = "0" + month;
    }

    return dt + "-" + month + "-" + year;
  };

  const handleOnChange = async () => {
    try {
      setArchived(!archived);
      dispatch(toggleArchive({ id: _id, isArchived: !archived }));
      handleClose();
    } catch (error) {
      console.error("Error while changing the state", error);
    }
  };

  const handlePrint = async () => {
    setIsSubmitting(true);

    const items = order.items.map((item) => {
      const meal = {
        type: item.type,
        name: item.name,
        base: item.base,
        proteins: item.proteins,
        extraProteins: item.extraProtein,
        garnishes: item.garnishes,
        toppings: item.toppings,
        sauces: item.sauces,
        quantity: item.quantity,
      };
      return meal;
    });

    const dataToPrint = {
      tableNumber,
      items: items,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/order/print-order`,
        { orderData: dataToPrint }
      );
      console.log("Commande envoyée avec succès:", response.data);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des données à l'API:",
        error.response?.data || error.message
      );
    }

    setIsSubmitting(false);
  };

  if (archived === true)
    return (
      <>
        <TableRow>
          <TableCell style={{ width: "110px" }}>
            <Typography>{orderDate()}</Typography>
          </TableCell>
          <TableCell>
            <Button variant="text" onClick={handleOpen}>
              <Typography>Table: {tableNumber}</Typography>
            </Button>
          </TableCell>
          <TableCell width={1}>
            {isSubmitting ? (
              <CircularProgress />
            ) : (
              <IconButton aria-label="print" onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            )}
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
