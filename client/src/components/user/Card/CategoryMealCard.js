import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";

const CategoryMealCard = ({ meal }) => {
  const { name, description, price, picture, isPopular } = meal;

  return (
    <Card>
      <CardActionArea>
        <CardContent sx={{ display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <Typography variant="body1">{name}</Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                pt: 0.5,
              }}
            >
              {description}
            </Typography>
            <Typography variant="body2" sx={{ pt: 0.5 }}>
              {price}€
              <span style={{ color: "#e67400" }}>
                {isPopular ? " · Populaire" : null}
              </span>
            </Typography>
          </Box>
          <CardMedia
            component="img"
            sx={{
              height: 100,
              aspectRatio: "1/1",
              ml: 2,
              borderRadius: "4px",
              maxWidth: 100,
            }}
            image={`/img/${picture}.webp`}
            alt={name}
          />
          <Box
            sx={{
              minWidth: "40px",
              ml: 2,
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: "4px",
              color: "rgba(0, 0, 0, 0.26)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddIcon />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryMealCard;
