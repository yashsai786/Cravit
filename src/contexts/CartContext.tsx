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
  getDoc,
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
  cartType: 'food' | 'instamart';
}

interface CartContextType {
  items: CartItem[]; // All items for the user
  foodItems: CartItem[];
  instamartItems: CartItem[];
  addItem: (item: any, restaurantId: string, restaurantName: string, cartType: 'food' | 'instamart', remarks?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: (cartType?: 'food' | 'instamart') => Promise<void>;
  activeCartType: 'food' | 'instamart';
  setActiveCartType: (type: 'food' | 'instamart') => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  foodCount: number;
  instamartCount: number;
  currentItems: CartItem[];
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCartType, setActiveCartType] = useState<'food' | 'instamart'>('food');
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
        id: docSnap.id,
        itemId: docSnap.data().itemId,
      })) as any[];
      
      const mappedItems = cartItems.map(item => ({
        ...item,
        price: Number(item.price),
        cartType: item.cartType || 'food' // Default to food for legacy data
      })) as CartItem[];
      
      setItems(mappedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = useCallback(async (item: any, restaurantId: string, restaurantName: string, cartType: 'food' | 'instamart' = 'food', remarks?: string) => {
    if (!user) {
      toast.error("Please sign in to add items to cart!");
      return;
    }

    try {
      // 1. Stock Validation for Instamart
      if (cartType === 'instamart') {
         const invDoc = await getDoc(doc(db, "instamart_inventory", item.id));
         if (invDoc.exists()) {
            const stock = Number(invDoc.data().stock || 0);
            const inCart = items.find(i => (i as any).itemId === item.id)?.quantity || 0;
            if (inCart + 1 > stock) {
               toast.error(`Only ${stock} units available in local hub.`);
               return;
            }
         }
      }

      // Check if item already in cart for this user AND this cart type
      const existing = items.find(i => (i as any).itemId === item.id && i.cartType === cartType);
      
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
          category: item.category || "",
          cartType: cartType
        });
      }
      toast.success(cartType === 'instamart' ? "Added to Instamart cart!" : "Added to cart!");
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
        const cartItem = items.find(i => i.id === cartDocId);
        
        // Stock Validation for Instamart
        if (cartItem?.cartType === 'instamart') {
           const inventoryId = cartItem.itemId || cartItem.id;
           const invDoc = await getDoc(doc(db, "instamart_inventory", inventoryId));
           if (invDoc.exists()) {
              const stock = Number(invDoc.data().stock || 0);
              if (quantity > stock) {
                 toast.error(`Local hub capacity: ${stock} units.`);
                 return;
              }
           }
        }

        await updateDoc(doc(db, "cart", cartDocId), { quantity });
      } catch (error) {
        console.error("Error updating quantity", error);
      }
    }
  }, [user, removeItem, items]);

  const clearCart = useCallback(async (cartType?: 'food' | 'instamart') => {
    if (!user) return;
    try {
      let q = query(collection(db, "cart"), where("userId", "==", user.uid));
      if (cartType) {
        // If type specified, only clear that type
        // Note: we might need to filter manually if cartType is newly added
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (!cartType || data.cartType === cartType || (cartType === 'food' && !data.cartType)) {
             batch.delete(docSnap.ref);
          }
        });
        await batch.commit();
      } else {
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  }, [user]);

  const applyCoupon = useCallback((code: string) => setAppliedCoupon(code), []);
  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const foodItems = items.filter(i => i.cartType === 'food' || !i.cartType);
  const instamartItems = items.filter(i => i.cartType === 'instamart');
  
  const currentItems = activeCartType === 'food' ? foodItems : instamartItems;

  const subtotal = currentItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal === 0 ? 0 : (subtotal > 149 ? 0 : 40);
  const tax = Math.round(subtotal * 0.05);
  const discount = appliedCoupon === "WELCOME50" ? Math.min(Math.round(subtotal * 0.5), 100)
    : appliedCoupon === "PARTY" ? Math.round(subtotal * 0.2)
    : 0;
  const total = subtotal + deliveryFee + tax - discount;
  
  const foodCount = foodItems.reduce((sum, i) => sum + i.quantity, 0);
  const instamartCount = instamartItems.reduce((sum, i) => sum + i.quantity, 0);
  const itemCount = currentItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, foodItems, instamartItems,
      addItem, removeItem, updateQuantity, clearCart,
      activeCartType, setActiveCartType,
      appliedCoupon, applyCoupon, removeCoupon,
      subtotal, deliveryFee, tax, discount, total, 
      itemCount, foodCount, instamartCount,
      currentItems,
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
