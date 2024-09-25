import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BottomDrawer from "../Modal/BottomDrawer";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import BaseForm from "./Form/BaseForm";
import SaucesForm from "./Form/SaucesForm";
import SideForm from "./Form/SideForm";
import SupProtForm from "./Form/SupProtForm";

const PopularCard = ({ meal }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { name, price, picture, description, type } = meal;

  const [selectedBase, setSelectedBase] = useState();
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedProtSup, setselectedProtSup] = useState([]);

  const [count, setCount] = useState(1);

  const [addSideCounts, setAddSideCounts] = useState({});

  const sidePrices = {
    "Fallafels x5": 3.5,
    "Salade d'edamame": 3.5,
  };

  const proteinPrices = {
    Saumon: 3.5,
    Thon: 3.5,
    "Poulet croustillant": 3.5,
    Gyoza: 3.5,
  };

  const handleBaseChange = (value) => {
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
      setIsLoading(false);
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

  const sendToCart = () => {
    setIsLoading(true);

    setTimeout(() => {
      const items = {
        type,
        name,
        base: selectedBase,
        sauces: selectedSauces,
        extraProtein: selectedProtSup,
        sides: Object.keys(addSideCounts).filter(
          (side) => addSideCounts[side] > 0
        ),
        count,
        totalPrice: calculateTotalPrice(),
      };

      const storedMeals = sessionStorage.getItem("Cart");
      let meals = [];

      if (storedMeals) {
        meals = JSON.parse(storedMeals);
      }

      meals.push(items);

      sessionStorage.setItem("Cart", JSON.stringify(meals));

      setOpen(false);
    }, 1000);
  };

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

            <BaseForm
              selectedBase={selectedBase}
              handleBaseChange={handleBaseChange}
            />
            <SaucesForm
              selectedSauces={selectedSauces}
              handleSauceChange={handleSauceChange}
              isSauceDisabled={isSauceDisabled}
            />
            <SideForm
              handleSideChange={handleSideChange}
              addSideCounts={addSideCounts}
            />
            <SupProtForm
              handleProtSupChange={handleProtSupChange}
              isProtDisabled={isProtDisabled}
              selectedProtSup={selectedProtSup}
            />
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
            onClick={sendToCart}
          >
            {isLoading ? (
              <CircularProgress color="secondary" size={24.5} />
            ) : (
              `Ajouter pour ${calculateTotalPrice().replace(".", ",")} €`
            )}
          </Button>
        </Box>
      </BottomDrawer>
    </>
  );
};

export default PopularCard;
