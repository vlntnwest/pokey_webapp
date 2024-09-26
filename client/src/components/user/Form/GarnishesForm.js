import {
  Checkbox,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

const GarnishesForm = ({
  selectedGarnishes,
  handleGarnishesChange,
  isGarnisheDisabled,
}) => {
  const garnishes = [
    "Concombre",
    "Avocat",
    "Maïs",
    "Carottes râpées",
    "Jalapeños",
    "Pousses de soja",
    "Tomates cerises",
  ];
  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Choisis 4 accompagnements !
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
        Obligatoire
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {garnishes.map((garnishe) => (
          <ListItemButton
            key={garnishe}
            onClick={() => handleGarnishesChange(garnishe)}
            sx={{ p: 0 }}
            disabled={
              isGarnisheDisabled && !selectedGarnishes.includes(garnishe)
            }
          >
            <ListItemText
              primary={garnishe}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <Checkbox
              checked={selectedGarnishes.includes(garnishe)}
              onChange={() => handleGarnishesChange(garnishe)}
              value={garnishe}
            />
          </ListItemButton>
        ))}
      </List>
    </FormGroup>
  );
};

export default GarnishesForm;
