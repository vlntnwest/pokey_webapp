import React from "react";
import {
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const sides = [
  { name: "Fallafels x5", price: "3,50" },
  { name: "Salade d'edamame", price: "3,50" },
];

const SideForm = ({ handleSideChange, addSideCounts }) => {
  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Envie d'accompagnements pour compléter ton pokey ?
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {sides.map((side) => (
          <ListItemButton
            key={side.name}
            onClick={() => handleSideChange(side.name)}
            sx={{ p: 0 }}
          >
            <ListItemText
              primary={side.name}
              disableTypography
              sx={{ fontSize: 16, fontWeight: "400" }}
            />
            <span style={{ fontSize: 16, fontWeight: "400" }}>
              +{side.price}€
            </span>
            {addSideCounts[side.name] > 0 ? (
              <>
                <RemoveCircleOutlineIcon
                  color="primary"
                  sx={{ margin: "11px" }}
                />
                <span>{addSideCounts[side.name]}</span>
                <AddCircleOutlineIcon
                  color="disabled"
                  sx={{ margin: "11px" }}
                />
              </>
            ) : (
              <AddCircleOutlineIcon sx={{ margin: "11px" }} />
            )}
          </ListItemButton>
        ))}
      </List>
    </FormGroup>
  );
};

export default SideForm;
