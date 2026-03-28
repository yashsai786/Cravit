import { useParams, Link } from "react-router-dom";
import { Star, Clock, ArrowLeft, Plus, Minus, Loader2, Info, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const { items, addItem, updateQuantity } = useCart();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [jainPreferences, setJainPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      try {
        const docSnap = await getDoc(doc(db, "restaurants", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRestaurant({
            id: docSnap.id,
            ...data,
            name: data.restaurantName || data.name || "Unnamed Kitchen",
            cuisine: data.cuisine || ["Indian"],
            rating: data.rating || 4.2,
            deliveryTime: data.deliveryTime || "30 mins",
            costForTwo: data.costForTwo || 300,
            image: data.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80"
          });
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };

    fetchRestaurant();

    const q = query(collection(db, "items"), where("restaurantId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setMenuItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
           <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px]">Preparing the Menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl py-20 text-center">
          <div className="h-16 w-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xl font-display font-black text-foreground uppercase tracking-widest italic">Kitchen Closed</p>
          <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest">This restaurant hasn't set up their profile yet.</p>
          <Link to="/" className="text-primary font-black mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-xl border border-primary/20 hover:bg-primary/5 transition-all uppercase tracking-widest text-[10px]">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map((m) => m.category || "Main Course"))];
  const displayCategory = activeCategory || categories[0];

  const getCartQty = (itemId: string) => items.find((i) => (i as any).itemId === itemId)?.quantity || 0;
  const getCartDocId = (itemId: string) => items.find((i) => (i as any).itemId === itemId)?.id || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="w-full max-w-[900px] mx-auto pb-20 pt-4">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden mx-4 shadow-premium group">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
          <Link to="/" className="absolute top-6 left-6 h-10 w-10 rounded-2xl glass flex items-center justify-center backdrop-blur-md border border-foreground/10 active:scale-90 transition-all hover:bg-foreground/10 shadow-premium">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-4xl text-foreground tracking-tighter italic uppercase">{restaurant.name}</h1>
              <p className="text-muted-foreground text-[10px] mt-2 font-black tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> {restaurant.cuisine.join(" • ")}
              </p>
            </div>
            <div className="flex items-center gap-3 glass p-3 rounded-2xl border border-foreground/10 self-start md:self-auto shadow-premium">
               <div className="flex flex-col items-center px-3 border-r border-foreground/10">
                  <span className="flex items-center gap-1.5 text-xs font-black text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" /> {restaurant.rating}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">Rating</span>
               </div>
               <div className="flex flex-col items-center px-3 border-r border-foreground/10">
                  <span className="text-xs font-black text-foreground italic">{restaurant.deliveryTime}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">Time</span>
               </div>
               <div className="flex flex-col items-center px-3">
                  <span className="text-xs font-black text-foreground italic">₹{restaurant.costForTwo}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">2 Pers</span>
               </div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-8 px-6 no-scrollbar h-24 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${displayCategory === cat ? "bg-primary text-white shadow-xl shadow-primary/30" : "glass text-muted-foreground border-foreground/5 hover:border-foreground/20 hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <section className="px-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-px bg-foreground/5 flex-1" />
             <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{displayCategory}</span>
             <div className="h-px bg-foreground/5 flex-1" />
          </div>

          {(menuItems.filter((m) => (m.category === displayCategory) || (!m.category && displayCategory === "Main Course")).length === 0) && (
             <div className="py-20 text-center rounded-[2.5rem] border border-foreground/5 border-dashed">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No units identified in this sector</p>
             </div>
          )}

          {menuItems
            .filter((m) => (m.category === displayCategory) || (!m.category && displayCategory === "Main Course"))
            .map((item, i) => {
              const qty = getCartQty(item.id);
              const cartDocId = getCartDocId(item.id);
              return (
                <div key={item.id} className="flex gap-6 p-6 rounded-[2.5rem] glass-card border border-foreground/5 hover:border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-4 shadow-premium group" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-4 w-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${item.isVeg ? "border-emerald-500" : "border-rose-500"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                      </div>
                      {item.isBestseller && (
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded-md">★ Bestseller</span>
                      )}
                    </div>
                    <h3 className="font-display font-black text-lg text-foreground italic uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors leading-none">{item.name}</h3>
                    <p className="font-display font-black text-foreground italic text-base">₹{item.price}</p>
                    <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed line-clamp-2 max-w-sm font-black uppercase tracking-widest opacity-70">{item.description}</p>
                    
                    {item.isJain && (
                      <button 
                        onClick={() => setJainPreferences(prev => ({...prev, [item.id]: !prev[item.id]}))}
                        className={`mt-6 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${jainPreferences[item.id] ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10' : 'glass border-foreground/5 text-muted-foreground'}`}
                      >
                         {jainPreferences[item.id] ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                         Jain Option Protocol
                      </button>
                    )}
                  </div>
                  <div className="relative shrink-0 w-32 h-32">
                    <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover rounded-3xl shadow-xl border border-foreground/10" loading="lazy" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%]">
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item, restaurant.id, restaurant.name, jainPreferences[item.id] ? "jain" : "")}
                          className="w-full h-10 bg-secondary text-primary font-display font-black text-[10px] uppercase tracking-[0.2em] border border-primary/20 rounded-xl shadow-premium hover:bg-primary hover:text-white transition-all transform active:scale-90"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-primary h-10 rounded-xl overflow-hidden shadow-xl shadow-primary/20 border border-white/10">
                          <button onClick={() => updateQuantity(cartDocId, qty - 1)} className="flex-1 flex items-center justify-center text-white hover:bg-black/10 h-full transition-all">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-black text-white text-xs min-w-[20px] text-center italic">{qty}</span>
                          <button onClick={() => updateQuantity(cartDocId, qty + 1)} className="flex-1 flex items-center justify-center text-white hover:bg-black/10 h-full transition-all">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
};

export default RestaurantPage;
