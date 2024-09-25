import {
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

const BaseForm = ({ selectedBase, handleBaseChange }) => {
  const bases = ["Riz", "Quinoa"];

  return (
    <RadioGroup value={selectedBase} sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Choisissez votre base
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
        Obligatoire
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {bases.map((base) => (
          <ListItemButton
            key={base}
            sx={{ p: 0 }}
            onClick={() => handleBaseChange(base)}
          >
            <ListItemText
              primary={base}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <Radio
              checked={selectedBase === base}
              value={base}
              name="radio-buttons"
              sx={{ ml: 2 }}
            />
          </ListItemButton>
        ))}
      </List>
    </RadioGroup>
  );
};

export default BaseForm;
