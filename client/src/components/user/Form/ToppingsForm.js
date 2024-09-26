import {
  Checkbox,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

const ToppingsForm = ({
  selectedToppings,
  handleToppingsChange,
  isToppingsDisabled,
}) => {
  const toppings = [
    "Cacahuètes",
    "Graines de sésames",
    "Muesli",
    "Baies de grandes",
    "Oignons cebette",
  ];
  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Choisis 2 toppings !
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
        Obligatoire
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {toppings.map((topping) => (
          <ListItemButton
            key={topping}
            onClick={() => handleToppingsChange(topping)}
            sx={{ p: 0 }}
            disabled={isToppingsDisabled && !selectedToppings.includes(topping)}
          >
            <ListItemText
              primary={topping}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <Checkbox
              checked={selectedToppings.includes(topping)}
              onChange={() => handleToppingsChange(topping)}
              value={topping}
            />
          </ListItemButton>
        ))}
      </List>
    </FormGroup>
  );
};

export default ToppingsForm;
