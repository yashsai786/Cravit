import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Clock, MapPin, Calendar, Users, Utensils, Check, ArrowLeft, Phone, Mail, Image as ImageIcon, Star } from "lucide-react";

interface DineoutRestaurant {
  name: string;
  address: string;
  pincode: string;
  approxCostForTwo: number;
  cuisines: string[];
  restaurantImage: string;
  menuImages: string[];
  petFriendly: boolean;
  latitude?: string;
  longitude?: string;
  isAcceptingBookings?: boolean;
}

const DineoutRestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [restaurant, setRestaurant] = useState<DineoutRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestName, setGuestName] = useState(userProfile?.displayName || "");
  const [guestCount, setGuestCount] = useState("2");
  const [phone, setPhone] = useState(userProfile?.contact || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [wantBouquet, setWantBouquet] = useState(false);
  const [wantCake, setWantCake] = useState(false);
  const [otherRequests, setOtherRequests] = useState("");
  
  const [activeTab, setActiveTab] = useState<"book" | "menu">("book");

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "dineout_restaurants", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRestaurant(docSnap.data() as DineoutRestaurant);
        } else {
          toast.error("Restaurant not found.");
          navigate("/dineout");
        }
      } catch (error) {
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id, navigate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      toast.error("You must be logged in to book a table.");
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Confirming your reservation...");

    try {
      // Simulate booking process. In reality, we'd save to a bookings collection.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingData = {
        restaurantId: id,
        userId: userProfile.uid,
        guestName,
        guestCount: parseInt(guestCount),
        date: bookingDate,
        time: bookingTime,
        phone,
        email,
        specialRequests: {
          bouquet: wantBouquet,
          cake: wantCake,
          other: otherRequests
        },
        status: "confirmed",
        createdAt: Date.now()
      };

      await addDoc(collection(db, "dineout_bookings"), bookingData);

      toast.success(`Table booked at ${restaurant?.name}!`, { id: toastId });
      navigate("/dineout");
    } catch (error) {
      toast.error("Failed to confirm booking. Try again.", { id: toastId });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-80px)] bg-[#0F172A] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!restaurant) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0F172A] pb-24 font-sans text-slate-300">
        {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <button onClick={() => navigate("/dineout")} className="absolute top-8 left-8 z-20 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-primary transition-all">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={restaurant.restaurantImage} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:px-16 z-10">
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest text-[10px] font-black">{restaurant.cuisines.join(", ")}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {restaurant.address}</span>
            <span className="flex items-center gap-1.5"><Utensils className="h-4 w-4" /> ₹{restaurant.approxCostForTwo} for 2 (approx.)</span>
            {restaurant.petFriendly && <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest text-[10px] font-black">Pet Friendly</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-800 pb-px">
            <button onClick={() => setActiveTab("book")} className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'book' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}>Reserve Table</button>
            <button onClick={() => setActiveTab("menu")} className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}>View Menu</button>
          </div>

          {restaurant.isAcceptingBookings === false ? (
            <div className="mt-8 p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-center">
               <p className="text-xl font-display font-black text-rose-500 uppercase tracking-widest leading-none">Reservations Closed</p>
               <p className="text-sm font-bold text-rose-500/60 mt-2">This venue is not accepting new tables at this moment.</p>
            </div>
          ) : (
            <>
              {activeTab === "book" && (
                <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-8">
              <h3 className="text-2xl font-display text-white font-bold mb-6">Reservation Details</h3>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input required type="date" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors [color-scheme:dark]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input required type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors [color-scheme:dark]" />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest Count</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input required type="number" min="1" max="20" value={guestCount} onChange={e => setGuestCount(e.target.value)} className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Host Name</label>
                    <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors" placeholder="John Doe" />
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,""))} maxLength={10} className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors" placeholder="9876543210" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors" placeholder="name@example.com" />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="pt-6 border-t border-slate-800 space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Special Arrangements</h4>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={wantBouquet} onChange={e => setWantBouquet(e.target.checked)} className="w-5 h-5 rounded cursor-pointer accent-primary bg-slate-800 border-slate-700" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Surprise Bouquet 💐</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={wantCake} onChange={e => setWantCake(e.target.checked)} className="w-5 h-5 rounded cursor-pointer accent-primary bg-slate-800 border-slate-700" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Celebratory Cake 🎂</span>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Other Requests</label>
                    <textarea value={otherRequests} onChange={e => setOtherRequests(e.target.value)} className="w-full h-24 p-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-primary focus:outline-none transition-colors resize-none" placeholder="Allergies, seating preferences, etc." />
                  </div>
                </div>

                <button type="submit" disabled={bookingLoading} className="w-full h-14 rounded-2xl bg-gradient-hero text-white font-display font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3">
                  {bookingLoading ? "Transmitting..." : <><Check className="h-5 w-5" /> Confirm Reservation</>}
                </button>
              </form>
            </div>
              )}
            </>
          )}

          {activeTab === "menu" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {restaurant.menuImages && restaurant.menuImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {restaurant.menuImages.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
                      <img src={img} alt={`Menu Page ${i+1}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Page {i+1}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                  <ImageIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Digital menu unavailable</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Mini Info / Offers */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Star className="h-4 w-4" fill="currentColor" /> Premium Offers
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <p className="text-lg font-bold text-white mb-1">Flat 10% Off</p>
                <p className="text-xs text-slate-400">on total bill • Pre-book offer</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
                <p className="text-lg font-bold text-white mb-1">10% Cashback</p>
                <p className="text-xs text-slate-400">using partner credit cards</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Location Map</h3>
            <div className="w-full h-48 bg-slate-800 rounded-2xl overflow-hidden relative">
              {/* Dummy Map Placeholder */}
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Ahmedabad&zoom=13&size=600x300&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:landscape|element:geometry|color:0x2c5a71&style=feature:water|element:geometry|color:0x0e171d')] bg-cover bg-center opacity-50 grayscale contrast-125"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
              </div>
            </div>
            {restaurant.latitude && restaurant.longitude && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 mt-4 rounded-xl border-2 border-primary/50 text-white hover:bg-primary/20 hover:border-primary transition-all flex items-center justify-center gap-2 font-display font-bold text-sm bg-primary/10 shadow-lg shadow-primary/5 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🗺️</span> Direct me there
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default DineoutRestaurantPage;
