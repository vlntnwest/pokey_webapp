import React from "react";
import { Box, CardMedia, Typography, Divider, Fab } from "@mui/material";
import FormRenderer from "./Form/FormRenderer";
import CloseIcon from "@mui/icons-material/Close";

const MealDisplay = ({ meal, options, handlers, setOpen }) => {
  const { name, picture, description, type } = meal;
  return (
    <Box sx={{ flexGrow: "1", overflowY: "auto", overflowX: "hidden" }}>
      <CardMedia
        component="img"
        image={`https://g10afdaataaj4tkl.public.blob.vercel-storage.com/img/${picture}.webp`}
        alt={name}
        sx={{ height: "40%" }}
      />
      <Fab
        color="primary"
        aria-label="close"
        onClick={() => {
          setOpen(false);
        }}
        sx={{ position: "absolute", top: 0, right: 0, m: 2 }}
      >
        <CloseIcon />
      </Fab>
      <Box p={2}>
        <Typography variant="h3" sx={{ fontSize: 26 }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 16, mt: 1 }}>
          {description}
        </Typography>
        <Divider sx={{ mt: 2 }} />
        <FormRenderer type={type} options={options} handlers={handlers} />
      </Box>
    </Box>
  );
};

export default MealDisplay;
