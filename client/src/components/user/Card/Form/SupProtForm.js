import React from "react";
import {
  Checkbox,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const SupProtForm = ({
  handleProtSupChange,
  isProtDisabled,
  selectedProtSup,
}) => {
  const supProts = [
    { name: "Saumon", price: "3,50" },
    { name: "Thon", price: "3,50" },
    { name: "Poulet croustillant", price: "3,50" },
    { name: "Gyoza", price: "3,50" },
  ];
  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Protéines supplémentaires
      </Typography>
      <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
        Voulez-vous des protéines en supplément?
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {supProts.map((supProt) => (
          <ListItemButton
            key={supProt.name}
            onClick={() => handleProtSupChange(supProt.name)}
            sx={{ p: 0 }}
            disabled={isProtDisabled && !selectedProtSup.includes(supProt.name)}
          >
            <ListItemText
              primary={supProt.name}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <span style={{ fontSize: 16, fontWeight: "400" }}>
              +{supProt.price}€
            </span>
            <Checkbox
              checked={selectedProtSup.includes(supProt.name)}
              onChange={() => handleProtSupChange(supProt.name)}
              value={supProt.name}
            />
          </ListItemButton>
        ))}
      </List>
    </FormGroup>
  );
};

export default SupProtForm;
