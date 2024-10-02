import React, { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import MealDetails from "../MealDetails";

const PopularCard = ({ meal }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 125,
          maxWidth: 125,
        }}
      >
        <CardActionArea
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
          onClick={() => setOpen(true)}
        >
          <CardMedia
            component="img"
            image={`https://g10afdaataaj4tkl.public.blob.vercel-storage.com/img/${meal.picture}.webp`}
            alt={meal.name}
            sx={{ aspectRatio: "1/1" }}
          />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              p: 1,
              width: "100%",
            }}
          >
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              {meal.name}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: "auto" }}>
              {meal.price}€
            </Typography>
            <Box
              sx={{
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "4px",
                color: "rgba(0, 0, 0, 0.26)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
                minHeight: "34px",
              }}
            >
              <AddIcon />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      <MealDetails meal={meal} open={open} setOpen={setOpen} />
    </>
  );
};

export default PopularCard;
