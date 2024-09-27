import React, { useState } from "react";
import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import CartValidator from "./CartValidator";

const Cart = ({ setOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <CartHeader setOpen={setOpen} />
      <CartSummary />
      <CartValidator isLoading={isLoading} />
    </>
  );
};

export default Cart;
