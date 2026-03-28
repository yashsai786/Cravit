import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  writeBatch,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  category?: string;
  isVeg?: boolean;
}

export interface CartItem extends MenuItem {
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  remarks?: string;
  itemId?: string; // Original menu item ID
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any, restaurantId: string, restaurantName: string, remarks?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Sync cart with Firestore
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "cart"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cartItems = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        id: docSnap.id, // This will be the doc id in cart collection
        itemId: docSnap.data().itemId, // Original menu item id
      })) as any[];
      
      // We need to map it correctly to the CartItem interface
      const mappedItems = cartItems.map(item => ({
        ...item,
        price: Number(item.price)
      })) as CartItem[];
      
      setItems(mappedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = useCallback(async (item: any, restaurantId: string, restaurantName: string, remarks?: string) => {
    if (!user) {
      toast.error("Please sign in to add items to cart!");
      return;
    }

    try {
      // Check if item already in cart for this user
      const existing = items.find(i => (i as any).itemId === item.id);
      if (existing) {
        await updateDoc(doc(db, "cart", existing.id), {
          quantity: existing.quantity + 1
        });
      } else {
        await addDoc(collection(db, "cart"), {
          itemId: item.id,
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          description: item.description || "",
          restaurantId,
          restaurantName,
          userId: user.uid,
          quantity: 1,
          remarks: remarks || "",
          isVeg: item.isVeg || false,
          category: item.category || ""
        });
      }
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart", error);
      toast.error("Failed to add item");
    }
  }, [user, items]);

  const removeItem = useCallback(async (cartDocId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "cart", cartDocId));
    } catch (error) {
      console.error("Error removing from cart", error);
    }
  }, [user]);

  const updateQuantity = useCallback(async (cartDocId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeItem(cartDocId);
    } else {
      try {
        await updateDoc(doc(db, "cart", cartDocId), { quantity });
      } catch (error) {
        console.error("Error updating quantity", error);
      }
    }
  }, [user, removeItem]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "cart"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  }, [user]);

  const applyCoupon = useCallback((code: string) => setAppliedCoupon(code), []);
  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 149 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const discount = appliedCoupon === "WELCOME50" ? Math.min(Math.round(subtotal * 0.5), 100)
    : appliedCoupon === "PARTY" ? Math.round(subtotal * 0.2)
    : 0;
  const total = subtotal + deliveryFee + tax - discount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      appliedCoupon, applyCoupon, removeCoupon,
      subtotal, deliveryFee, tax, discount, total, itemCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
