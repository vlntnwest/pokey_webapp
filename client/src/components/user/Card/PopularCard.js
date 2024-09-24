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
import BottomDrawer from "../Modal/BottomDrawer";

const PopularCard = ({ meal }) => {
  const [open, setOpen] = useState(false);
  const { name, price, picture } = meal;

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
            image={`/img/${picture}.webp`}
            alt={name}
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
            <Typography
              variant="body1"
              sx={{
                flexGrow: 1,
              }}
            >
              {name}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: "auto" }}>
              {price}€
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
              }}
              fullWidth
            >
              <AddIcon />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      <BottomDrawer open={open} setOpen={setOpen}></BottomDrawer>
    </>
  );
};

export default PopularCard;
