import { createContext, useContext, useEffect, useState } from "react";

const ShoppingCartContext = createContext({});

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}

export default function ShoppingCartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = sessionStorage.getItem("Cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const addToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const updateItemCount = (itemId, newCount) => {
    if (newCount === 0) {
      removeFromCart(itemId);
    } else {
      const updatedCart = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newCount } : item
      );
      setCartItems(updatedCart);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((currentItems) => {
      return currentItems.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    sessionStorage.setItem("Cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const cartItems = sessionStorage.getItem("Cart");
    if (cartItems) {
      setCartItems(JSON.parse(cartItems));
    }
  }, []);

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateItemCount,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}
