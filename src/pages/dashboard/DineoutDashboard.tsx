import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { Users, Calendar, Clock, Phone, Loader2, Utensils, CheckCircle2, Ticket, Power } from "lucide-react";

const DineoutDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    // Fetch initial state of restaurant
    const fetchRestaurantState = async () => {
      const docRef = doc(db, "dineout_restaurants", userProfile.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.isAcceptingBookings !== undefined) {
          setIsAcceptingBookings(data.isAcceptingBookings);
        }
      }
    };
    fetchRestaurantState();

    // Listen strictly to bookings for this restaurant
    const q = query(collection(db, "dineout_bookings"), where("restaurantId", "==", userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      // Sort newest first
      b.sort((x: any, y: any) => y.createdAt - x.createdAt);
      setBookings(b);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const toggleAcceptingBookings = async () => {
    if (!userProfile) return;
    setToggling(true);
    try {
      const docRef = doc(db, "dineout_restaurants", userProfile.uid);
      await updateDoc(docRef, {
        isAcceptingBookings: !isAcceptingBookings
      });
      setIsAcceptingBookings(!isAcceptingBookings);
      toast.success(
        !isAcceptingBookings ? "You are now accepting new table bookings!" : "Bookings have been paused temporarily."
      );
    } catch (error) {
      toast.error("Failed to update booking status.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Header />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const pastBookings = bookings.filter(b => b.date < todayStr);
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const futureBookings = bookings.filter(b => b.date > todayStr);

  const renderBookingCard = (booking: any) => (
                 <div key={booking.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
                    {/* Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-2">
                       <CheckCircle2 className="h-3 w-3" /> Confirmed
                    </div>

                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className="text-2xl font-black text-white font-display italic tracking-tight uppercase leading-none">{booking.guestName}</p>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">ID: {booking.id}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-1 border border-white/5 group-hover:bg-slate-800 transition-colors">
                          <Calendar className="h-4 w-4 text-slate-500 mb-1" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                          <p className="text-sm font-black text-white">{booking.date}</p>
                       </div>
                       <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-1 border border-white/5 group-hover:bg-slate-800 transition-colors">
                          <Clock className="h-4 w-4 text-slate-500 mb-1" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</p>
                          <p className="text-sm font-black text-white">{booking.time}</p>
                       </div>
                       <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-1 border border-white/5 group-hover:bg-slate-800 transition-colors">
                          <Users className="h-4 w-4 text-slate-500 mb-1" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Count</p>
                          <p className="text-sm font-black text-white">{booking.guestCount} Guests</p>
                       </div>
                       <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-1 border border-white/5 group-hover:bg-slate-800 transition-colors overflow-hidden">
                          <Phone className="h-4 w-4 text-slate-500 mb-1" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comm Link</p>
                          <p className="text-sm font-black text-white truncate">{booking.phone}</p>
                       </div>
                    </div>

                    {/* Special Requests */}
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2">Special Requests Required</p>
                       <div className="flex flex-wrap gap-2 mb-3">
                          {booking.specialRequests?.bouquet && <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-xs font-bold text-white tracking-wide">💐 Surprise Bouquet</span>}
                          {booking.specialRequests?.cake && <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-xs font-bold text-white tracking-wide">🎂 Celebratory Cake</span>}
                          {!booking.specialRequests?.bouquet && !booking.specialRequests?.cake && !booking.specialRequests?.other && <span className="text-xs font-bold text-slate-500 italic">None logged.</span>}
                       </div>
                       {booking.specialRequests?.other && (
                          <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5">
                             <p className="text-xs font-bold text-slate-300 italic">"{booking.specialRequests.other}"</p>
                          </div>
                       )}
                    </div>
                 </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Operational Switch Component */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
             <Utensils className="h-40 w-40" />
          </div>
          
          <div>
            <h1 className="font-display font-black text-3xl text-white uppercase italic tracking-tighter shadow-primary">DINEOUT COMMAND CENTER</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Manage reservations and spatial limits</p>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-3 pr-6 rounded-3xl border border-white/5">
             <button 
                onClick={toggleAcceptingBookings}
                disabled={toggling}
                className={`relative flex items-center justify-center h-14 w-20 rounded-2xl transition-all shadow-xl shadow-black/50 overflow-hidden ${isAcceptingBookings ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
             >
                {toggling ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Power className="h-6 w-6 text-white" />}
             </button>
             <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isAcceptingBookings ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {isAcceptingBookings ? "Accepting Tables" : "Capacity Full / Paused"}
                </p>
                <p className="text-xs font-bold text-slate-500">Master Switch</p>
             </div>
          </div>
        </div>

        {/* List of Incoming Bookings */}
        <div className="space-y-12">
           {bookings.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-slate-800 border-dashed rounded-[2rem]">
               <Ticket className="h-12 w-12 text-slate-700 mb-4" />
               <p className="text-lg font-bold text-slate-500 h">No reservations logged yet</p>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-2">Waiting for customer signals...</p>
             </div>
           ) : (
             <>
                  <div className="mb-12">
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <Ticket className="h-6 w-6 text-primary" /> Today's Reservations
                    </h2>
                    {todayBookings.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {todayBookings.map(renderBookingCard)}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 border-dashed text-center">
                         <p className="text-slate-500 font-bold text-sm">No reservations logged for today.</p>
                      </div>
                    )}
                  </div>
                
                  <div className="mb-12">
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <Calendar className="h-6 w-6 text-emerald-500" /> Future Reservations
                    </h2>
                    {futureBookings.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {futureBookings.map(renderBookingCard)}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 border-dashed text-center">
                         <p className="text-slate-500 font-bold text-sm">No upcoming reservations logged.</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-display font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 mb-6">
                        <Clock className="h-6 w-6 text-slate-600" /> Past History
                    </h2>
                    {pastBookings.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-80">
                          {pastBookings.map(renderBookingCard)}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 border-dashed text-center">
                         <p className="text-slate-500 font-bold text-sm">No historical records found.</p>
                      </div>
                    )}
                  </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default DineoutDashboard;
