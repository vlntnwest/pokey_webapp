import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import ItemsList from "./ItemList";
import { Divider } from "@mui/material";
import { isEmpty } from "../../Utils";
import { useDispatch } from "react-redux";
import { toggleArchive } from "../../../actions/order.action";

const OrderCard = ({ order, modal, handleOnChange }) => {
  const { items, tableNumber, specialInstructions, isArchived, _id } = order;

  const dispatch = useDispatch();

  const [archived, setArchived] = useState(isArchived);

  const handleLocalChange = async () => {
    try {
      setArchived(!archived);
      dispatch(toggleArchive({ id: _id, isArchived: !archived }));
      if (modal === true) handleOnChange();
    } catch (error) {
      console.error("Error while changing the state", error);
    }
  };

  if (archived === false || modal === true)
    return (
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5">Table: {tableNumber}</Typography>
          <Divider sx={{ my: 1 }} />
          {items.map((item, index) => (
            <ItemsList key={index} item={item} />
          ))}
          {!isEmpty(specialInstructions) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ color: "text.secondary" }}>Comments</Typography>
              <Typography variant="body2">{specialInstructions}</Typography>
            </>
          )}
        </CardContent>
        <Grid container spacing={0}>
          <Grid size={6}>
            <Button fullWidth variant="text">
              Print
            </Button>
          </Grid>
          <Grid size={6}>
            <Button fullWidth variant="text" onClick={handleLocalChange}>
              {archived ? "Unarchive" : "Archive"}
            </Button>
          </Grid>
        </Grid>
      </Card>
    );
};

export default OrderCard;
