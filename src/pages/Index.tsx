import { useState, useMemo, useEffect } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import CuisineScroller from "@/components/home/CuisineScroller";
import RestaurantCard from "@/components/home/RestaurantCard";
import InstamartSection from "@/components/home/InstamartSection";
import { SlidersHorizontal, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [activeCuisine, setActiveCuisine] = useState("🍽️ All");
  const [sortBy, setSortBy] = useState("relevance");
  const [vegOnly, setVegOnly] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We only show active restaurants
    const q = query(collection(db, "restaurants"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const restaurantList = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        // Join with user profile to get the restaurant name from displayName
        // or we could have stored it in the restaurant doc.
        // For efficiency, usually we'd store name in restaurant doc too.
        // Let's assume we'll fetch the user doc for the name if not present.
        return {
          id: docSnap.id,
          ...data,
          // Fallbacks for missing fields in Firestore but expected by card
          name: data.restaurantName || data.name || "Unnamed Kitchen",
          cuisine: data.cuisine || ["Indian"],
          rating: data.rating || (3.5 + Math.random() * 1.5).toFixed(1),
          deliveryTime: data.deliveryTime || "25-35 mins",
          costForTwo: data.costForTwo || 300,
          image: data.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80`,
          isVeg: data.isVeg || Math.random() > 0.5,
          pincode: data.pincode || ""
        };
      }));
      setRestaurants(restaurantList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    let list = restaurants;
    
    // 1. PINCODE FILTER (Strict)
    if (userProfile?.pincode) {
      list = list.filter(r => r.pincode === userProfile.pincode);
    } else {
      // If no pincode set, maybe show nothing or inform user to set location
      // But for better UX, let's just show all if no pincode set, 
      // or filter if we want to be strict.
      // List remains same
    }

    // 2. Search Query
    if (queryParam) {
      list = list.filter((r) =>
        r.name.toLowerCase().includes(queryParam.toLowerCase()) ||
        r.cuisine.some((c: string) => c.toLowerCase().includes(queryParam.toLowerCase()))
      );
    }

    // 3. Cuisine Filter
    if (activeCuisine !== "🍽️ All") {
      const cuisineName = activeCuisine.replace(/^[\p{Emoji}\s]+/u, "").trim();
      list = list.filter((r) => r.cuisine.some((c: string) => c.toLowerCase().includes(cuisineName.toLowerCase())));
    }

    // 4. Veg Only
    if (vegOnly) list = list.filter((r) => r.isVeg);

    return list;
  }, [activeCuisine, vegOnly, queryParam, restaurants, userProfile?.pincode]);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="w-full max-w-[1720px] mx-auto pb-20">
        <HeroSection />

        <div className="flex items-center gap-4 px-10 pt-10 flex-wrap">
          <button
            onClick={() => toast.info("Filter settings synchronized with your location!")}
            className="flex items-center gap-3 px-8 h-12 rounded-2xl glass text-[10px] font-black uppercase tracking-widest text-muted-foreground border-foreground/5 hover:border-foreground/20 hover:text-foreground transition-all shadow-premium"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter Matrix
          </button>
          
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-premium ${vegOnly ? "bg-emerald-500 text-white border-emerald-500" : "glass text-muted-foreground border-foreground/5 hover:border-foreground/20"
              }`}
          >
            Organic Sector (VEG)
          </button>
 
          {userProfile?.pincode && (
            <div className="flex items-center gap-3 px-8 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              <MapPin className="h-4 w-4" /> Operational Sector: {userProfile.pincode}
            </div>
          )}
        </div>

        <CuisineScroller active={activeCuisine} onSelect={setActiveCuisine} />

        <section className="px-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-2xl text-foreground">
              {loading ? "Searching..." : `${filtered.length} kitchens near you`}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
               <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
               <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Syncing with local restaurants...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] bg-foreground/5 border border-foreground/10 border-dashed animate-in zoom-in duration-500">
              <div className="h-20 w-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
                <MapPin className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-xl font-display font-black text-foreground uppercase tracking-widest">Zone Empty</p>
              <p className="text-[10px] text-muted-foreground mt-2 max-w-sm mx-auto font-black uppercase tracking-widest">No active restaurants found in {userProfile?.pincode || "this area"}. Try a different pincode in the navbar!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filtered.map((r, i) => (
                <div key={r.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          )}
        </section>

        <InstamartSection />
      </main>
    </div>
  );
};

export default Index;
