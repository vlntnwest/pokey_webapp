import React, { useEffect, useState } from "react";
import BottomDrawer from "./Modal/BottomDrawer";
import MealDisplay from "./MealDisplay";
import CompositionValidator from "./CompositionValidator";
import { useShoppingCart } from "../Context/ShoppingCartContext";

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
  const { addToCart } = useShoppingCart();

  const { name, price, type, _id } = meal;
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const [selectedBase, setSelectedBase] = useState();
  const [selectedProt, setSelectedProt] = useState([]);
  const [selectedGarnishes, setSelectedGarnishes] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedProtSup, setSelectedProtSup] = useState([]);
  const [selectedSide, setSelectedSide] = useState([]);
  const [count, setCount] = useState(1);
  const [addSideCounts, setAddSideCounts] = useState({});

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setSelectedBase(null);
    setSelectedProt([]);
    setSelectedGarnishes([]);
    setSelectedToppings([]);
    setSelectedSauces([]);
    setSelectedProtSup([]);
    setCount(1);
    setAddSideCounts({});
    setIsLoading(false);
  };

  const isSauceDisabled = selectedSauces.length >= 2;
  const isGarnisheDisabled = selectedGarnishes.length >= 4;
  const isToppingsDisabled = selectedToppings.length >= 2;
  const isSupProtDisabled = selectedProtSup.length >= 1;

  const isAddButtonDisabled = () => {
    if (type === "bowl") {
      return !selectedBase || selectedSauces.length === 0;
    } else if (type === "side") {
      return selectedSauces.length === 0;
    } else if (type === "custom") {
      return (
        !selectedBase ||
        selectedSauces.length === 0 ||
        selectedGarnishes === 0 ||
        selectedToppings === 0
      );
    } else return false;
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
      const item = {
        id: `${_id}-${timestamp}`,
        type,
        name,
        base: selectedBase,
        proteins: selectedProt,
        garnishes: selectedGarnishes,
        toppings: selectedToppings,
        sauces: selectedSauces || [],
        extraProtein: selectedProtSup,
        quantity: count,
        price,
      };

      const sides = [];

      selectedSide.forEach((sideArray) => {
        const side = {
          id: `${_id}-${timestamp}-side`,
          type: "side",
          name: sideArray[0],
          sauces: sideArray[1] ? [sideArray[1]] : [],
          quantity: count,
          price,
        };
        sides.push(side);
      });

      addToCart(item); // Ajout du plat principal au panier
      sides.forEach((side) => addToCart(side));

      setOpen(false);
    }, 1000);
  };

  const handlers = {
    handleBaseChange: (value) => setSelectedBase(value),
    handleProtChange: (value) => setSelectedProt(value),
    handleSauceChange: (sauce) => {
      if (selectedSauces.includes(sauce)) {
        setSelectedSauces(selectedSauces.filter((s) => s !== sauce));
      } else if (selectedSauces.length < 2) {
        setSelectedSauces([...selectedSauces, sauce]);
      }
    },
    handleGarnishesChange: (garnishe) => {
      if (selectedGarnishes.includes(garnishe)) {
        setSelectedGarnishes(selectedGarnishes.filter((s) => s !== garnishe));
      } else if (selectedGarnishes.length < 4) {
        setSelectedGarnishes([...selectedGarnishes, garnishe]);
      }
    },
    handleToppingsChange: (topping) => {
      if (selectedToppings.includes(topping)) {
        setSelectedToppings(selectedToppings.filter((s) => s !== topping));
      } else if (selectedToppings.length < 4) {
        setSelectedToppings([...selectedToppings, topping]);
      }
    },
    handleProtSupChange: (prot) => {
      if (selectedProtSup.includes(prot)) {
        setSelectedProtSup(selectedProtSup.filter((s) => s !== prot));
      } else if (selectedProtSup.length < 1) {
        setSelectedProtSup([...selectedProtSup, prot]);
      }
    },
    handleSideChange: (side, count, sauce) => {
      // Met à jour le compteur
      setAddSideCounts((prevCounts) => ({
        ...prevCounts,
        [side]: count,
      }));

      // Met à jour le tableau selectedSide
      setSelectedSide((prev) => {
        const existingSideIndex = prev.findIndex((s) => s[0] === side);

        if (existingSideIndex !== -1) {
          // Si le side existe déjà, le remplacer
          const updatedSides = [...prev];
          updatedSides[existingSideIndex] = [side, sauce, count]; // Remplace l'ancienne entrée
          return updatedSides; // Retourne le tableau mis à jour
        } else {
          // Si le side n'existe pas, on l'ajoute
          return [...prev, [side, sauce, count]];
        }
      });
    },
    handleIncrement: () => setCount((prev) => prev + 1),
    handleDecrement: () => setCount((prev) => (prev > 1 ? prev - 1 : prev)),
  };

  const options = {
    selectedBase,
    selectedProt,
    selectedGarnishes,
    selectedToppings,
    selectedSauces,
    selectedProtSup,
    addSideCounts,
    isGarnisheDisabled,
    isToppingsDisabled,
    isSauceDisabled,
    isSupProtDisabled,
  };

  return (
    <BottomDrawer open={open} setOpen={setOpen}>
      <MealDisplay
        meal={meal}
        options={options}
        handlers={handlers}
        setOpen={setOpen}
      />
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
