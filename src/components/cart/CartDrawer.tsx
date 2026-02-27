import React from 'react';
import { useCart } from '../../contexts/CartContext';

const CartDrawer = ({ isOpen, onClose }: any) => {
    const { items, updateQuantity, getTotal } = useCart();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Your Cart</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-gray-500">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-orange-500 font-bold">-</button>
                                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-orange-500 font-bold">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between mb-4 font-bold text-lg">
                        <span>Subtotal</span>
                        <span>₹{getTotal()}</span>
                    </div>
                    <button className="w-full py-4 bg-orange-500 text-white font-black rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-colors">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
