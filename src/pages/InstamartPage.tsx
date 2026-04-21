import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { instamartCategories } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Clock, Search, ShoppingBag, Sparkles, Zap, ChevronRight, Filter, Info, Plus, MapPin, Loader2 } from "lucide-react";

const InstamartPage = () => {
  const { userProfile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { addItem, instamartItems, updateQuantity, isSharedCart, tempName } = useCart();
  const [scrolled, setScrolled] = useState(false);
  
  const [store, setStore] = useState<any>(null);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Fetch Store by Pincode
  useEffect(() => {
    if (!userProfile?.pincode) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "instamart_stores"), where("pincode", "==", userProfile.pincode));
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

  // 2. Fetch Items for that Store
  useEffect(() => {
    if (!store?.id) return;

    setLoading(true);
    const q = query(collection(db, "instamart_inventory"), where("storeId", "==", store.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItemsList(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store?.id]);

  const filtered = itemsList
    .filter((i) => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || i.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort(() => (activeCategory === "All" ? Math.random() - 0.5 : 0));

  const getQty = (id: string) => instamartItems.find((i) => (i.itemId === id || i.id === id))?.quantity || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Hero Banner Section */}
      <div className="relative h-64 w-full bg-gradient-to-br from-indigo-900 via-violet-800 to-fuchsia-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="container max-w-6xl h-full flex flex-col justify-center px-6 relative z-10">
            <div className="flex items-center justify-between">
              <h1 className="font-display font-black text-5xl md:text-6xl text-white tracking-tighter italic uppercase animate-in slide-in-from-left duration-700 delay-100">
                {(store?.name ? store.name.split(' ')[0] : 'Instamart')}<span className="text-indigo-300">.</span>
              </h1>
              {isSharedCart && (
                <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-in slide-in-from-right duration-700">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Shared Session</span>
                    <span className="text-xs font-bold text-white mt-1">{tempName || "Guest User"}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-white/70 text-sm font-medium mt-2 max-w-md animate-in slide-in-from-left duration-700 delay-200">
               {store?.name ? `Serving your sector from ${store.name}.` : 'Premium groceries delivered to your coordinate in 10 minutes.'}
            </p>
         </div>
      </div>

      <main className="container max-w-6xl -mt-10 relative z-20 pb-20 px-4 md:px-6">
        {loading ? (
          <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center shadow-premium border border-slate-100">
             <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-6" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Establishing Satellite Uplink...</p>
          </div>
        ) : !store ? (
          <div className="bg-white rounded-[3rem] p-24 text-center shadow-premium border border-slate-100 animate-in zoom-in duration-500 font-sans">
             <div className="h-24 w-24 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <MapPin className="h-10 w-10 text-slate-300" />
             </div>
             <h2 className="font-display font-black text-3xl text-slate-900 uppercase italic tracking-tighter mb-4">No Service Node Detected</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                Our logistics matrix does not yet cover sector <span className="text-indigo-600 font-black">[{userProfile?.pincode || "unknown"}]</span>. Ensure your profile location is synchronized.
             </p>
             <button onClick={() => window.location.href = "/"} className="mt-10 h-14 px-10 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">Synchronize Coordinates</button>
          </div>
        ) : (
        <>
        {/* Search Bar Float */}
        <div className="bg-white rounded-[2rem] shadow-premium p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center gap-6 border border-slate-200/60 backdrop-blur-xl animate-in zoom-in duration-500">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Locate essentials, snacks, and more..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner"
              />
           </div>
           <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-indigo-100">
                 <Clock className="h-4 w-4" /> 10 MINS
              </div>
              <button className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg">
                 <Filter className="h-5 w-5" />
              </button>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Professional Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-2 md:sticky md:top-24 md:h-fit">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {instamartCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`group flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeCategory === cat 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1" 
                    : "bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${activeCategory === cat ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                </button>
              ))}
            </div>
          </aside>

          {/* Items Inventory Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
               <h2 className="font-display font-black text-2xl text-slate-900 italic uppercase tracking-tighter">
                  {activeCategory} <span className="text-slate-300 font-normal">({filtered.length})</span>
               </h2>
               <div className="h-px flex-1 bg-slate-200 mx-6 opacity-50" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => {
                const qty = getQty(item.id);
                const isLowStock = item.inStock && (item as any).stock < 10;
                return (
                  <div key={item.id} className={`group bg-white rounded-[2.5rem] border border-slate-100 p-5 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-3xl bg-slate-50 border border-slate-50">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        loading="lazy" 
                      />
                      {isLowStock && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/20">
                           Critical Stock
                        </div>
                      )}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                           <span className="text-white text-xs font-black uppercase tracking-widest border border-white/20 px-4 py-2 rounded-xl">Sold Out</span>
                        </div>
                      )}
                    </div>

                    <div className="px-1 flex-1 flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.unit}</span>
                       <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.name}</h4>
                       
                       <div className="flex items-center gap-3 mt-4 mb-6">
                          <div className="flex-1">
                             <div className="flex items-baseline gap-2">
                                <span className="font-display font-black text-xl text-slate-900 tracking-tight">₹{item.price}</span>
                                {item.originalPrice && (
                                  <span className="text-xs text-slate-400 font-bold line-through opacity-60">₹{item.originalPrice}</span>
                                )}
                             </div>
                          </div>
                          {qty > 0 && (
                             <div className="flex items-center bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                in cart
                             </div>
                          )}
                       </div>

                       <div className="mt-auto">
                        {!item.inStock ? (
                          <div className="w-full h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock depleted</div>
                        ) : qty === 0 ? (
                          <button
                            onClick={() =>
                              addItem({ id: item.id, name: item.name, price: item.price, description: "", image: item.image, category: item.category, isVeg: true }, store.id, store.name, "instamart")
                            }
                            className="w-full h-12 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <Plus className="h-4 w-4" /> Purchase
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-indigo-600 rounded-2xl p-1 shadow-lg shadow-indigo-600/20">
                            <button onClick={() => {
                              const cartItem = instamartItems.find(i => i.itemId === item.id || i.id === item.id);
                              if (cartItem) updateQuantity(cartItem.id, qty - 1);
                            }} className="h-10 w-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all">
                               <Zap className="h-4 w-4 rotate-180" />
                            </button>
                            <span className="text-sm font-black text-white">{qty}</span>
                            <button 
                               onClick={() => {
                                 const cartItem = instamartItems.find(i => i.itemId === item.id || i.id === item.id);
                                 if (cartItem) updateQuantity(cartItem.id, qty + 1);
                               }} 
                               disabled={qty >= (item as any).stock}
                               title={qty >= (item as any).stock ? "Local hub capacity reached" : ""}
                               className={`h-10 w-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all ${qty >= (item as any).stock ? 'opacity-20 cursor-not-allowed' : ''}`}
                             >
                                <Plus className="h-4 w-4" />
                             </button>
                          </div>
                        )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filtered.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Info className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-50" />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">No items detected in this sector</p>
                <button onClick={() => setSearch("")} className="mt-6 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Reset Search Matrix</button>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>

      {/* Floating Cart HUD (only if items present) */}
      {instamartItems.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-700">
            <button 
              onClick={() => {
                window.location.href = "/cart";
              }}
              className="bg-slate-900 text-white rounded-full px-8 h-16 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all group"
            >
               <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                  <ShoppingBag className="h-5 w-5 text-indigo-400 group-hover:animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-widest">{instamartItems.length} Products</span>
               </div>
               <span className="text-sm font-display font-black italic uppercase tracking-wider">Execute Checkout</span>
               <div className="h-8 w-8 rounded-full bg-white text-slate-900 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
               </div>
            </button>
         </div>
      )}
    </div>
  );
};

export default InstamartPage;
