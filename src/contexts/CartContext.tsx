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
  addedBy?: string;
  sharedCartId?: string;
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
  sharedId: string | null;
  tempName: string | null;
  startSharingCart: () => Promise<string | null>;
  joinSharedCart: (sharedId: string, name: string) => Promise<void>;
  stopSharingCart: () => Promise<void>;
  isSharedCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCartType, setActiveCartType] = useState<'food' | 'instamart'>('food');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(localStorage.getItem('sharedCartId'));
  const [tempName, setTempName] = useState<string | null>(localStorage.getItem('cartTempName'));

  const stopSharingCart = useCallback(async () => {
    if (sharedId) {
      try {
        const sharedRef = doc(db, "shared_carts", sharedId);
        const snap = await getDoc(sharedRef);
        if (snap.exists() && snap.data().hostId === user?.uid) {
          await updateDoc(sharedRef, { status: "closed" });
        }
      } catch (e) { /* ignore cleanup errors */ }
    }
    setSharedId(null);
    setTempName(null);
    localStorage.removeItem('sharedCartId');
    localStorage.removeItem('cartTempName');
    localStorage.removeItem('sharedCartExpiry');
    toast.info("Shared cart session ended.");
  }, [sharedId, user?.uid]);

  // Check for expired shared cart on mount
  useEffect(() => {
    const expiry = localStorage.getItem('sharedCartExpiry');
    if (expiry && Date.now() > Number(expiry)) {
      stopSharingCart();
    }
  }, [stopSharingCart]);

  // Cleanup shared cart on logout
  useEffect(() => {
    if (!user && sharedId && !localStorage.getItem('cartTempName')) {
       // Only stop sharing if we are a logged out user who didn't explicitly join as a guest
       stopSharingCart();
    }
  }, [user, sharedId, stopSharingCart]);

  // Sync cart with Firestore
  useEffect(() => {
    if (!user && !sharedId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let q;
    if (sharedId && sharedId !== "null" && sharedId !== "undefined") {
      q = query(collection(db, "cart"), where("sharedCartId", "==", sharedId));
    } else if (user) {
      q = query(collection(db, "cart"), where("userId", "==", user.uid));
    } else {
      setItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Check if shared session is still active in DB
      if (sharedId) {
        const sharedDoc = await getDoc(doc(db, "shared_carts", sharedId));
        if (sharedDoc.exists() && sharedDoc.data().status === "closed") {
           stopSharingCart();
           return;
        }
      }

      const cartItems = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        id: docSnap.id,
        itemId: (docSnap.data() as any).itemId,
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
  }, [user, sharedId]);

  const addItem = useCallback(async (item: any, restaurantId: string, restaurantName: string, cartType: 'food' | 'instamart' = 'food', remarks?: string) => {
    if (!user && !sharedId) {
      toast.error("Please sign in or join a shared cart to add items!");
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

      // In shared cart, we allow multiple entries of the same item if added by different people
      // or we can group them and just list the names.
      // The user requested: "aur us item ke niche kisne add kiya hai wo naam likha aayega"
      // This implies we should probably treat items by different users as separate entries OR keep a list of names.
      // Let's go with separate entries for simplicity if 'addedBy' is different.
      
      const adderName = tempName || user?.displayName || "Guest";
      const existing = items.find(i => 
        (i as any).itemId === item.id && 
        i.cartType === cartType && 
        (i.remarks || "") === (remarks || "") &&
        (sharedId ? i.addedBy === adderName : true)
      );
      
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
          userId: user?.uid || "guest",
          sharedCartId: sharedId || null,
          addedBy: adderName,
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
  }, [user, items, sharedId, tempName]);

  const startSharingCart = async () => {
    if (!user) {
      toast.error("Only logged in users can host a shared cart.");
      return null;
    }

    try {
      const newSharedId = `cart_${user.uid}_${Date.now()}`;
      const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes

      await setDoc(doc(db, "shared_carts", newSharedId), {
        hostId: user.uid,
        hostName: user.displayName || "Host",
        createdAt: Date.now(),
        expiresAt: expiry,
        status: "active"
      });

      // Move existing items to this shared cart
      const batch = writeBatch(db);
      items.forEach(item => {
        if (!item.sharedCartId) {
          batch.update(doc(db, "cart", item.id), { 
            sharedCartId: newSharedId,
            addedBy: user.displayName || "Host"
          });
        }
      });
      await batch.commit();

      setSharedId(newSharedId);
      localStorage.setItem('sharedCartId', newSharedId);
      localStorage.setItem('sharedCartExpiry', expiry.toString());
      
      return newSharedId;
    } catch (error) {
      console.error("Error starting cart share", error);
      toast.error("Failed to share cart");
      return null;
    }
  };

  const joinSharedCart = async (id: string, name: string) => {
    try {
      const sharedDoc = await getDoc(doc(db, "shared_carts", id));
      if (!sharedDoc.exists()) {
        toast.error("Shared cart link is invalid or expired.");
        return;
      }

      const data = sharedDoc.data();
      if (!data || (data.expiresAt && Date.now() > data.expiresAt)) {
        toast.error("This shared cart session has expired.");
        return;
      }

      setSharedId(id);
      setTempName(name);
      localStorage.setItem('sharedCartId', id);
      localStorage.setItem('cartTempName', name);
      localStorage.setItem('sharedCartExpiry', data.expiresAt.toString());
      
      toast.success(`Joined ${data.hostName}'s cart!`);
    } catch (error) {
      console.error("Error joining cart", error);
      toast.error("Failed to join cart");
    }
  };

  const removeItem = useCallback(async (cartDocId: string) => {
    if (!user && !sharedId) return;
    try {
      await deleteDoc(doc(db, "cart", cartDocId));
    } catch (error) {
      console.error("Error removing from cart", error);
    }
  }, [user, sharedId]);

  const updateQuantity = useCallback(async (cartDocId: string, quantity: number) => {
    if (!user && !sharedId) return;
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
  }, [user, removeItem, items, sharedId]);

  const clearCart = useCallback(async (cartType?: 'food' | 'instamart') => {
    if (!user && !sharedId) return;
    try {
      let q;
      if (sharedId) {
        q = query(collection(db, "cart"), where("sharedCartId", "==", sharedId));
      } else {
        q = query(collection(db, "cart"), where("userId", "==", user?.uid));
      }

      if (cartType) {
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as any;
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
  }, [user, sharedId]);

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
      loading,
      sharedId,
      tempName,
      startSharingCart,
      joinSharedCart,
      stopSharingCart,
      isSharedCart: !!sharedId
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
