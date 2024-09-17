import { Box, Button, Modal, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import React, { useState } from "react";
import OrderCard from "./OrderCard";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { toggleArchive } from "../../../actions/order.action";

const OrderList = ({ order }) => {
  const theme = useTheme();
  const style = {
    width: "100%",
    borderRadius: 50,
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 1,
    display: "flex",
    justifyContent: "space-between",
  };
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
        <Box sx={style}>
          <Button onClick={handleOpen}>
            <Typography variant="h5">Table: {tableNumber}</Typography>
          </Button>
          <Box sx={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <Button>
              <PrintIcon />
            </Button>
            <Button>
              <UnarchiveIcon onClick={handleOnChange} />
            </Button>
          </Box>
        </Box>
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