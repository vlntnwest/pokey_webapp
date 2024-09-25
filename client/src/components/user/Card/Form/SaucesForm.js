import {
  Checkbox,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

const SaucesForm = ({ selectedSauces, handleSauceChange, isSauceDisabled }) => {
  const sauces = ["Soja salé", "Soja sucré", "Spicy"];

  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Choisissez vos sauces
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
        Obligatoire
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {sauces.map((sauce) => (
          <ListItemButton
            key={sauce}
            onClick={() => handleSauceChange(sauce)}
            sx={{ p: 0 }}
            disabled={isSauceDisabled && !selectedSauces.includes(sauce)}
          >
            <ListItemText
              primary={sauce}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <Checkbox
              checked={selectedSauces.includes(sauce)}
              onChange={() => handleSauceChange(sauce)}
              value={sauce}
            />
          </ListItemButton>
        ))}
      </List>
    </FormGroup>
  );
};

export default SaucesForm;
