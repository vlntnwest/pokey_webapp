import {
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

const ProtForm = ({ selectedProt, handleProtChange }) => {
  const prots = [
    "Saumon",
    "Saumon teriyaki",
    "Poulet croustillant",
    "Gyoza",
    "Fallafels",
    "Thon",
  ];

  return (
    <RadioGroup value={selectedProt} sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Choisis ta protéines
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {prots.map((prot) => (
          <ListItemButton
            key={prot}
            sx={{ p: 0 }}
            onClick={() => handleProtChange(prot)}
          >
            <ListItemText
              primary={prot}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <Radio
              checked={selectedProt === prot}
              value={prot}
              name="radio-buttons"
              sx={{ ml: 2 }}
            />
          </ListItemButton>
        ))}
      </List>
    </RadioGroup>
  );
};

export default ProtForm;
