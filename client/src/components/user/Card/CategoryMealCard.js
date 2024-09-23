import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";

const CategoryMealCard = () => {
  return (
    <Card>
      <CardActionArea>
        <CardContent sx={{ display: "flex" }}>
          <Box>
            <Typography component="div" variant="body1">
              California
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Saumon, avocat, crème cheese, wakame, tomates cerises, oignons
              frits et graines de sésame.
            </Typography>
            <Typography variant="body2">12,90€</Typography>
          </Box>
          <CardMedia
            component="img"
            sx={{ height: 100, aspectRatio: "1/1", ml: 2, borderRadius: "4px" }}
            image="/img/PokebowlCalifornia.webp"
            alt="California"
          />
          <Button variant="outlined" disabled sx={{ minWidth: "40px", ml: 2 }}>
            <AddIcon />
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryMealCard;
