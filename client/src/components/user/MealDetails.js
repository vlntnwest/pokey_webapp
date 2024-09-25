import React, { useEffect, useState } from "react";
import BottomDrawer from "./Modal/BottomDrawer";
import MealDisplay from "./MealDisplay";
import CompositionValidator from "./CompositionValidator";

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

const MealDetails = ({ meal, open, setOpen }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { name, price, type } = meal;
  const [selectedBase, setSelectedBase] = useState();
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedProtSup, setSelectedProtSup] = useState([]);
  const [count, setCount] = useState(1);
  const [addSideCounts, setAddSideCounts] = useState({});

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setSelectedBase(null);
    setSelectedSauces([]);
    setSelectedProtSup([]);
    setCount(1);
    setAddSideCounts({});
    setIsLoading(false);
  };

  const isSauceDisabled = selectedSauces.length >= 2;
  const isProtDisabled = selectedProtSup.length >= 1;

  const isAddButtonDisabled = () => {
    if (type === "bowl" || type === "custom") {
      return !selectedBase || selectedSauces.length === 0;
    } else if (type === "side") {
      return selectedSauces.length === 0;
    }
    return false;
  };

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

  const handlers = {
    handleBaseChange: (value) => setSelectedBase(value),
    handleSauceChange: (sauce) => {
      if (selectedSauces.includes(sauce)) {
        setSelectedSauces(selectedSauces.filter((s) => s !== sauce));
      } else if (selectedSauces.length < 2) {
        setSelectedSauces([...selectedSauces, sauce]);
      }
    },
    handleProtSupChange: (prot) => {
      if (selectedProtSup.includes(prot)) {
        setSelectedProtSup(selectedProtSup.filter((s) => s !== prot));
      } else if (selectedProtSup.length < 1) {
        setSelectedProtSup([...selectedProtSup, prot]);
      }
    },
    handleSideChange: (side) => {
      setAddSideCounts((prevCounts) => ({
        ...prevCounts,
        [side]: prevCounts[side] === 1 ? 0 : 1,
      }));
    },
    handleIncrement: () => setCount((prev) => prev + 1),
    handleDecrement: () => setCount((prev) => (prev > 1 ? prev - 1 : prev)),
  };

  const options = {
    selectedBase,
    selectedSauces,
    selectedProtSup,
    addSideCounts,
    isSauceDisabled,
    isProtDisabled,
  };

  return (
    <BottomDrawer open={open} setOpen={setOpen}>
      <MealDisplay meal={meal} options={options} handlers={handlers} />
      <CompositionValidator
        count={count}
        handleIncrement={handlers.handleIncrement}
        handleDecrement={handlers.handleDecrement}
        isAddButtonDisabled={isAddButtonDisabled()}
        sendToCart={sendToCart}
        isLoading={isLoading}
        calculateTotalPrice={calculateTotalPrice}
      />
    </BottomDrawer>
  );
};

export default MealDetails;
