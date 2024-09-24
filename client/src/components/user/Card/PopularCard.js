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
  const { name, price, picture } = meal;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 125,
      }}
    >
      <CardMedia
        component="img"
        image={`/img/${picture}.webp`}
        alt={name}
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
        <Typography variant="body1">{name}</Typography>
        <Typography variant="body2" sx={{ marginTop: "auto" }}>
          {price}€
        </Typography>
      </CardContent>
      <CardActions sx={{ paddingTop: 0 }}>
        <Button variant="outlined" fullWidth>
          <AddIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

export default PopularCard;
