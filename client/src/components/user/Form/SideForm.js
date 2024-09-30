import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  FormGroup,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const SideForm = ({ handleSideChange }) => {
  const [sides, setSides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sauceSelections, setSauceSelections] = useState({});
  const [addSideCounts, setAddSideCounts] = useState({});

  useEffect(() => {
    const fetchCustomItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/item/custom/sides`
        );
        setSides(response.data);
      } catch (err) {
        console.error("Error fetching custom items:", err);
        setError(
          "Une erreur s'est produite lors de la récupération des éléments."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomItems();
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ width: "100%" }}>
        Error: {error}
      </Alert>
    );
  }

  const handleSideAdd = (side) => {
    const currentCount = addSideCounts[side.name] || 0;
    const newCount = currentCount === 1 ? 0 : 1;

    setAddSideCounts((prevCounts) => ({
      ...prevCounts,
      [side.name]: newCount,
    }));

    const selectedSauce = sauceSelections[side.name] || null;
    if (side.hasSauce === false)
      handleSideChange(side.name, newCount, selectedSauce);
  };

  const handleSauceChange = (e, sideName) => {
    const selectedSauce = e.target.value;
    setSauceSelections((prevSelections) => ({
      ...prevSelections,
      [sideName]: selectedSauce,
    }));

    const count = addSideCounts[sideName] || 0;
    handleSideChange(sideName, count, selectedSauce);
  };

  return (
    <FormGroup sx={{ pt: 3 }}>
      <Typography variant="p" sx={{ fontSize: 20 }}>
        Envie d'accompagnements pour compléter ton pokey ?
      </Typography>
      <List sx={{ p: 0, pt: 1 }}>
        {sides.map((side) => (
          <div key={side.name}>
            <ListItemButton onClick={(e) => handleSideAdd(side)} sx={{ p: 0 }}>
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

            {side.hasSauce && addSideCounts[side.name] > 0 && (
              <Box>
                <FormControl fullWidth>
                  <InputLabel id="sideSauceSelectLabel">
                    Choisis ta sauce
                  </InputLabel>
                  <Select
                    labelId={`sideSauceSelectLabel-${side.name}`}
                    id={`sideSauceSelect-${side.name}`}
                    value={sauceSelections[side.name] || ""}
                    label="Sauce"
                    onChange={(e) => handleSauceChange(e, side.name)}
                    input={<OutlinedInput label="Choisis ta sauce" />}
                  >
                    <MenuItem value="Soja salé">Soja salé</MenuItem>
                    <MenuItem value="Soja sucré">Soja sucré</MenuItem>
                    <MenuItem value="Spicy mayo">Spicy mayo</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </div>
        ))}
      </List>
    </FormGroup>
  );
};

export default SideForm;
