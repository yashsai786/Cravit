import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, ShoppingBag, Zap, Sparkles, Plus, MapPin, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";

const InstamartSection = () => {
  const { userProfile } = useAuth();
  const { addItem, instamartItems: cartItems } = useCart();
  const [store, setStore] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Local Store
  useEffect(() => {
    if (!userProfile?.pincode) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "instamart_stores"), where("pincode", "==", userProfile.pincode), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setStore({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setStore(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userProfile?.pincode]);

  // 2. Fetch Featured Items
  useEffect(() => {
    if (!store?.id) return;

    const q = query(collection(db, "instamart_inventory"), where("storeId", "==", store.id), limit(8));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store?.id]);

  const getQty = (id: string) => cartItems.find((i) => i.itemId === id || i.id === id)?.quantity || 0;

  if (!userProfile?.pincode) return null;

  return (
    <section className="px-10 py-16 bg-[#0F172A]/5 backdrop-blur-3xl rounded-[4rem] mx-6 mb-16 border border-slate-200/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] -mr-10 -mt-10 group-hover:opacity-[0.05] transition-all duration-1000">
         <ShoppingBag className="h-96 w-96 text-indigo-600" />
      </div>
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="font-display font-black text-3xl text-slate-900 italic uppercase tracking-tighter">Instamart<span className="text-indigo-600">.</span></h2>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
              <Zap className="h-3 w-3 fill-current" /> 10 MINS
            </div>
            {store && (
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-100">
                 <MapPin className="h-3 w-3" /> {store.name}
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Premium essentials & gourmet snacks delivered instantly.</p>
        </div>
        <Link to="/instamart" className="group flex items-center gap-3 px-8 h-12 rounded-[1.5rem] bg-white border border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:border-indigo-600 transition-all shadow-premium">
          Satellite Feed (See All) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
           <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Scanning Local Sector Inventory...</p>
        </div>
      ) : !store ? (
        <div className="py-20 text-center bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
           <MapPin className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active Instamart node detected in your area [{userProfile.pincode}]</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-6 relative z-10">
        {items.map((item, idx) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} className="group/card bg-white rounded-[2rem] border border-slate-100 p-4 flex flex-col hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="relative aspect-square mb-3 rounded-2xl overflow-hidden bg-slate-50">
                 <img
                   src={item.image}
                   alt={item.name}
                   className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                   loading="lazy"
                 />
                 {qty > 0 && (
                   <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-600/20">
                     {qty}
                   </div>
                 )}
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.unit}</span>
              <h4 className="font-display font-bold text-xs text-slate-900 truncate uppercase mt-0.5">{item.name}</h4>
              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="font-display font-black text-sm text-slate-900 italic tracking-tight">₹{item.price}</span>
                <button
                  onClick={() =>
                    addItem(
                      { id: item.id, name: item.name, price: item.price, description: "", image: item.image, category: item.category, isVeg: true },
                      "instamart",
                      "Instamart",
                      "instamart",
                      store.id // Passing storeId for routing
                    )
                  }
                  className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-600/20"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
};

export default InstamartSection;
