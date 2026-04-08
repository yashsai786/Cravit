import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { MapPin, Utensils, Star, ShieldAlert } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface DineoutRestaurant {
  uid: string;
  name: string;
  address: string;
  pincode: string;
  approxCostForTwo: number;
  cuisines: string[];
  restaurantImage: string;
  petFriendly: boolean;
}

const DineoutPage = () => {
  const { userProfile } = useAuth();
  const [restaurants, setRestaurants] = useState<DineoutRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const isValidCityPincode = (pincode?: string) => {
    if (!pincode) return false;
    const pin = parseInt(pincode);
    return pin >= 380001 && pin <= 382481;
  };

  const userCanViewDineout = isValidCityPincode(userProfile?.pincode);

  useEffect(() => {
    if (!userCanViewDineout) {
      setLoading(false);
      return;
    }

    const fetchRestaurants = async () => {
      try {
        const q = query(collection(db, "dineout_restaurants"), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as DineoutRestaurant));
        
        // Filter those falling into the Ahmedabad range
        const ahmedabadRestaurants = docs.filter(r => isValidCityPincode(r.pincode));
        setRestaurants(ahmedabadRestaurants);
      } catch (error) {
        console.error("Failed to fetch dineout spots", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [userCanViewDineout, userProfile?.pincode]);

  if (!userProfile?.pincode) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
          <MapPin className="h-20 w-20 text-slate-700 mb-6" />
          <h1 className="text-3xl font-display font-bold text-white mb-4">Location Required</h1>
          <p className="text-slate-400 text-center max-w-md">Please set your logistics coordinate (pincode) in the top navigation bar to access Dineout venues.</p>
        </div>
      </>
    );
  }

  if (!userCanViewDineout) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          <ShieldAlert className="h-20 w-20 text-rose-500 mb-6 animate-pulse" />
          <h1 className="text-3xl font-display font-bold text-white mb-4 text-center">Service Unavailable in Your Area</h1>
          <p className="text-slate-400 text-center max-w-md text-lg">Currently, <strong className="text-white">Cravit Dineout</strong> is only active in Ahmedabad (Pincodes 380001 - 382481). We are rapidly expanding our vectors!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0F172A] pb-24">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center bg-slate-900 border-b border-primary/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
        <div className="relative z-10 text-center px-4">
           <h1 className="font-display font-black text-4xl md:text-6xl text-white italic uppercase tracking-tighter drop-shadow-2xl mb-4">Cravit Dineout</h1>
           <p className="text-primary-foreground font-bold text-sm md:text-base uppercase tracking-[0.2em] bg-primary/20 backdrop-blur-md px-6 py-2 rounded-full inline-block">Ahmedabad Exclusive Division</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
             <Utensils className="h-5 w-5 text-primary" /> Curated Experiences
           </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-slate-800/50 animate-pulse rounded-3xl border border-slate-700/50"></div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No venues discovered</h3>
            <p className="text-slate-400">Our scouts haven't locked onto any dineout locations in your sector yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map(r => (
              <Link to={`/dineout/${r.uid}`} key={r.uid} className="group relative bg-slate-800/40 border border-slate-700 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden hover:-translate-y-2 shadow-2xl hover:shadow-primary/10">
                 <div className="h-56 w-full relative overflow-hidden">
                   <img src={r.restaurantImage} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                   {r.petFriendly && (
                     <div className="absolute top-4 right-4 bg-primary/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                       Pet Friendly
                     </div>
                   )}
                 </div>
                 <div className="p-6">
                   <div className="flex items-start justify-between mb-2">
                     <h3 className="font-display font-bold text-2xl text-white line-clamp-1">{r.name}</h3>
                   </div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 truncate">{r.cuisines.join(", ")}</p>
                   <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
                     <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"><MapPin className="h-3.5 w-3.5 text-primary" /> {r.address.split(',')[0]}</span>
                     <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">₹{r.approxCostForTwo} for 2</span>
                   </div>
                 </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default DineoutPage;
