import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import ItemsList from "./ItemList";
import { Divider } from "@mui/material";
import { isEmpty } from "../Utils";

const OrderCard = ({ order }) => {
  const { items, tableNumber, specialInstructions, archived } = order;

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
      <Grid container fullWidth spacing={0}>
        <Grid item size={6} fullWidth>
          <Button fullWidth variant="text">
            Print
          </Button>
        </Grid>
        <Grid item size={6}>
          {archived ? (
            <Button fullWidth variant="text">
              Unarchive
            </Button>
          ) : (
            <Button fullWidth variant="text">
              Archive
            </Button>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

export default OrderCard;
