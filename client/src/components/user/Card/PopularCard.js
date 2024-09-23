import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const PopularCard = ({ meal }) => {
  const { name, price } = meal;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 125,
      }}
    >
      <CardMedia
        component="img"
        image="/img/PokebowlCalifornia.webp"
        alt="Pokey Signature California"
        sx={{ aspectRatio: "1/1" }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 1,
        }}
      >
        <Typography variant="h6">{name}</Typography>
        <Typography sx={{ marginTop: "auto" }}>{price}€</Typography>
      </CardContent>
      <CardActions sx={{ paddingTop: 0 }}>
        <Button variant="outlined" fullWidth sx={{ borderRadius: "4px" }}>
          <AddIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

export default PopularCard;
