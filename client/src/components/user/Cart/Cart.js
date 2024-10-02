import React from "react";
import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import CartValidator from "./CartValidator";

const Cart = ({ setOpen }) => {
  return (
    <>
      <CartHeader setOpen={setOpen} />
      <CartSummary />
      <CartValidator setOpen={setOpen} />
    </>
  );
};

export default Cart;
