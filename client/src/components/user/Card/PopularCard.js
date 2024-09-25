import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Checkbox,
  Divider,
  FormGroup,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BottomDrawer from "../Modal/BottomDrawer";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const PopularCard = ({ meal }) => {
  const [open, setOpen] = useState(false);
  const { name, price, picture, description } = meal;

  const [selectedBase, setSelectedBase] = useState();
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedProtSup, setselectedProtSup] = useState([]);

  const [count, setCount] = useState(1);

  const [addSideCounts, setAddSideCounts] = useState({});

  const sidePrices = {
    Fallafels: 3.5,
    SaladeEdamame: 3.5,
  };

  const proteinPrices = {
    Saumon: 3.5,
    Thon: 3.5,
  };

  const handleChange = (e) => {
    setSelectedBase(e.target.value);
  };

  const handleListItemClick = (value) => {
    setSelectedBase(value);
  };

  const handleSauceChange = (sauce) => {
    if (selectedSauces.includes(sauce)) {
      setSelectedSauces(selectedSauces.filter((s) => s !== sauce));
    } else if (selectedSauces.length < 2) {
      setSelectedSauces([...selectedSauces, sauce]);
    }
  };
  const handleProtSupChange = (prot) => {
    if (selectedProtSup.includes(prot)) {
      setselectedProtSup(selectedProtSup.filter((s) => s !== prot));
    } else if (selectedProtSup.length < 1) {
      setselectedProtSup([...selectedProtSup, prot]);
    }
  };

  useEffect(() => {
    if (!open) {
      setSelectedBase(null);
      setSelectedSauces([]);
      setselectedProtSup([]);
      setCount(1);
      setAddSideCounts({});
    }
  }, [open]);

  const isSauceDisabled = selectedSauces.length >= 2;
  const isProtDisabled = selectedProtSup.length >= 1;

  const calculateTotalPrice = () => {
    let totalPrice = parseFloat(price.replace(",", "."));

    Object.keys(addSideCounts).forEach((side) => {
      if (addSideCounts[side] > 0) {
        totalPrice += sidePrices[side] * addSideCounts[side];
      }
    });

    selectedProtSup.forEach((protein) => {
      totalPrice += proteinPrices[protein];
    });

    totalPrice *= count;

    return totalPrice.toFixed(2);
  };

  const handleSideChange = (side) => {
    setAddSideCounts((prevCounts) => ({
      ...prevCounts,
      [side]: prevCounts[side] === 1 ? 0 : 1, // Toggle between 0 and 1
    }));
  };
  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    if (count > 1) {
      setCount((prevCount) => prevCount - 1);
    }
  };

  const isAddButtonDisabled = !selectedBase || selectedSauces.length === 0;

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
                minHeight: "34px",
              }}
              fullWidth
            >
              <AddIcon />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      <BottomDrawer open={open} setOpen={setOpen}>
        <Box
          sx={{
            flexGrow: "1",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={`/img/${picture}.webp`}
            alt={name}
            fullWidth
            sx={{ height: "40%" }}
          />
          <Box p={2}>
            <Typography variant="h3" sx={{ fontSize: 26 }}>
              {name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 16, mt: 1 }}>
              {description}
            </Typography>
            <Divider sx={{ mt: 2 }} />

            <RadioGroup sx={{ pt: 3 }}>
              <Typography variant="p" sx={{ fontSize: 20 }}>
                Choisissez votre base
              </Typography>
              <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
                Obligatoire
              </Typography>
              <List sx={{ p: 0, pt: 1 }}>
                <ListItemButton
                  onClick={() => handleListItemClick("Riz")}
                  sx={{ p: 0 }}
                >
                  <ListItemText
                    primary="Riz"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <Radio
                    checked={selectedBase === "Riz"}
                    onChange={handleChange}
                    value="Riz"
                    name="radio-buttons"
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={() => handleListItemClick("Quinoa")}
                  sx={{ p: 0 }}
                >
                  <ListItemText
                    primary="Quinoa"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <Radio
                    checked={selectedBase === "Quinoa"}
                    onChange={handleChange}
                    value="Quinoa"
                    name="radio-buttons"
                  />
                </ListItemButton>
              </List>
            </RadioGroup>
            <FormGroup sx={{ pt: 3 }}>
              <Typography variant="p" sx={{ fontSize: 20 }}>
                Choisissez vos sauces
              </Typography>
              <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
                Obligatoire
              </Typography>
              <List sx={{ p: 0, pt: 1 }}>
                <ListItemButton
                  onClick={() => handleSauceChange("Soja salé")}
                  sx={{ p: 0 }}
                  disabled={
                    isSauceDisabled && !selectedSauces.includes("Soja salé")
                  }
                >
                  <ListItemText
                    primary="Soja salé"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <Checkbox
                    checked={selectedSauces.includes("Soja salé")}
                    onChange={() => handleSauceChange("Soja salé")}
                    value={"Soja salé"}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleSauceChange("Soja sucré")}
                  sx={{ p: 0 }}
                  disabled={
                    isSauceDisabled && !selectedSauces.includes("Soja sucré")
                  }
                >
                  <ListItemText
                    primary="Soja sucré"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <Checkbox
                    checked={selectedSauces.includes("Soja sucré")}
                    onChange={() => handleSauceChange("Soja sucré")}
                    value={"Soja sucré"}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleSauceChange("Spicy Mayo")}
                  sx={{ p: 0 }}
                  disabled={
                    isSauceDisabled && !selectedSauces.includes("Spicy Mayo")
                  }
                >
                  <ListItemText
                    primary="Spicy Mayo"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <Checkbox
                    checked={selectedSauces.includes("Spicy Mayo")}
                    onChange={() => handleSauceChange("Spicy Mayo")}
                    value={"Spicy Mayo"}
                  />
                </ListItemButton>
              </List>
            </FormGroup>
            <FormGroup sx={{ pt: 3 }}>
              <Typography variant="p" sx={{ fontSize: 20 }}>
                Envie d'accompagnements pour compléter ton pokey ?
              </Typography>
              <List sx={{ p: 0, pt: 1 }}>
                <ListItemButton
                  onClick={() => handleSideChange("Fallafels")}
                  sx={{ p: 0 }}
                >
                  <ListItemText
                    primary="Fallafels x5"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <span style={{ fontSize: 16, fontWeight: "400" }}>
                    +3,50€
                  </span>
                  {addSideCounts["Fallafels"] > 0 ? (
                    <>
                      <RemoveCircleOutlineIcon
                        color="primary"
                        sx={{ margin: "11px" }}
                      />
                      <span>{addSideCounts["Fallafels"]}</span>
                      <AddCircleOutlineIcon
                        color="disabled"
                        sx={{ margin: "11px" }}
                      />
                    </>
                  ) : (
                    <AddCircleOutlineIcon sx={{ margin: "11px" }} />
                  )}
                </ListItemButton>

                <ListItemButton
                  onClick={() => handleSideChange("SaladeEdamame")}
                  sx={{ p: 0 }}
                >
                  <ListItemText
                    primary="Salade d'edamame"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <span style={{ fontSize: 16, fontWeight: "400" }}>
                    +3,50€
                  </span>
                  {addSideCounts["SaladeEdamame"] > 0 ? (
                    <>
                      <RemoveCircleOutlineIcon
                        color="primary"
                        sx={{ margin: "11px" }}
                      />
                      <span>{addSideCounts["SaladeEdamame"]}</span>
                      <AddCircleOutlineIcon
                        color="disabled"
                        sx={{ margin: "11px" }}
                      />
                    </>
                  ) : (
                    <AddCircleOutlineIcon sx={{ margin: "11px" }} />
                  )}
                </ListItemButton>
              </List>
            </FormGroup>
            <FormGroup sx={{ pt: 3 }}>
              <Typography variant="p" sx={{ fontSize: 20 }}>
                Protéines supplémentaires
              </Typography>
              <Typography variant="body2" sx={{ color: "rgb(88, 92, 92)" }}>
                Voulez-vous des protéines en supplément?
              </Typography>
              <List sx={{ p: 0, pt: 1 }}>
                <ListItemButton
                  onClick={() => handleProtSupChange("Saumon")}
                  sx={{ p: 0 }}
                  disabled={
                    isProtDisabled && !selectedProtSup.includes("Saumon")
                  }
                >
                  <ListItemText
                    primary="Saumon"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <span style={{ fontSize: 16, fontWeight: "400" }}>
                    +3,50€
                  </span>
                  <Checkbox
                    checked={selectedProtSup.includes("Saumon")}
                    onChange={() => handleProtSupChange("Saumon")}
                    value={"Saumon"}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleProtSupChange("Thon")}
                  sx={{ p: 0 }}
                  disabled={isProtDisabled && !selectedProtSup.includes("Thon")}
                >
                  <ListItemText
                    primary="Thon"
                    disableTypography
                    sx={{ fontSize: 16, fontWeight: "400" }}
                  />
                  <span style={{ fontSize: 16, fontWeight: "400" }}>
                    +3,50€
                  </span>
                  <Checkbox
                    checked={selectedProtSup.includes("Thon")}
                    onChange={() => handleProtSupChange("Thon")}
                    value={"Thon"}
                  />
                </ListItemButton>
              </List>
            </FormGroup>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              pb: 2,
            }}
          >
            <RemoveCircleOutlineIcon
              color={count > 1 ? "primary" : "disabled"}
              onClick={handleDecrement}
              style={{ cursor: count > 0 ? "pointer" : "not-allowed" }}
            />

            <Typography
              variant="body1"
              sx={{ margin: "0 8px", minWidth: "20px", textAlign: "center" }}
            >
              {count}
            </Typography>

            <AddCircleOutlineIcon
              color="primary"
              onClick={handleIncrement}
              style={{ cursor: "pointer" }}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.5 }}
            disabled={isAddButtonDisabled}
          >
            Ajouter pour {calculateTotalPrice().replace(".", ",")}€
          </Button>
        </Box>
      </BottomDrawer>
    </>
  );
};

export default PopularCard;
