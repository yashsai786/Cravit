import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: any) => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (item: any) => {
        setItems((prev: any) => {
            const existing = prev.find((i: any) => i.id === item.id);
            if (existing) {
                return prev.map((i: any) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems((prev: any) => prev.map((item: any) => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter((item: any) => item.quantity > 0));
    };

    const getTotal = () => items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, updateQuantity, getTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
