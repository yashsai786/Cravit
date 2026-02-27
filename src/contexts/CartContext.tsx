import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: any) => {
  const [items, setItems] = useState<any>([]);

  const addToCart = (item: any) => {
    // FIXED: Using functional update to prevent stale state issues
    setItems((prev: any) => {
      const existing = prev.find((i: any) => i.id === item.id);
      if (existing) {
        return prev.map((i: any) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  return (
    <CartContext.Provider value={{ items, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
