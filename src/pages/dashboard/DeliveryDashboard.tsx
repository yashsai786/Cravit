import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, MapPin, TrendingUp, Clock, Check, Phone, Navigation, Loader2, Sparkles, Bike, CheckCircle2, ChevronRight, UserCog, ReceiptText, Map } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const navItems = [
  { label: "Operations", path: "/dashboard/delivery", icon: <Package className="h-4 w-4" /> },
  { label: "Logistics Logs", path: "/dashboard/delivery/history", icon: <Clock className="h-4 w-4" /> },
  { label: "Fiscal Stats", path: "/dashboard/delivery/earnings", icon: <TrendingUp className="h-4 w-4" /> },
];

const DeliveryDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile, updateProfile } = useAuth();
  
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [pincodeInput, setPincodeInput] = useState("");
  const [settingUp, setSettingUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid || !userProfile?.pincode) {
      setLoading(false);
      return;
    }

    // Listener 1: Available Orders (Geofenced by Pincode)
    const qAvailable = query(collection(db, "orders"), where("pincode", "==", userProfile.pincode));
    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      const allSectorOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const unassigned = allSectorOrders.filter((o: any) => {
        // Broaden acceptance to include both modern and legacy status fields
        const isKitchenActive = ["accepted", "preparing", "handed_over"].includes(o.kitchenStatus || o.orderStatus);
        const isLogisticsPending = o.deliveryStatus === "pending" || !o.deliveryStatus;
        return isKitchenActive && isLogisticsPending && !o.deliveryPartnerId && o.orderStatus !== "cancelled";
      });
      setAvailableOrders(unassigned);
    }, (error) => {
      console.error("LOGISTICS_FEED_SYNC_ERROR", error);
      toast.error("Dispatch stream unstable.");
    });

    // Listener 2: My Active Shipments
    const qMy = query(collection(db, "orders"), where("deliveryPartnerId", "==", userProfile.uid));
    const unsubMy = onSnapshot(qMy, (snapshot) => {
      const myManifest = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const active = myManifest.filter((o: any) => 
        ["assigned", "picked", "on-way"].includes(o.deliveryStatus || o.orderStatus)
      );
      setMyOrders(active);
    }, (error) => {
      console.error("ACTIVE_HAUL_SYNC_ERROR", error);
    });

    // Listener 3: Historical Data
    const qHistory = query(collection(db, "orders"), where("deliveryPartnerId", "==", userProfile.uid));
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      const myManifest = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const fulfilled = myManifest.filter((o: any) => 
        (o.deliveryStatus === "delivered" || o.orderStatus === "delivered")
      );
      setHistory(fulfilled);
      setLoading(false);
    }, (error) => {
      console.error("HISTORY_SYNC_ERROR", error);
      setLoading(false);
    });

    return () => {
      unsubAvailable();
      unsubMy();
      unsubHistory();
    };
  }, [userProfile?.uid, userProfile?.pincode]);

  const handlePincodeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length !== 6) return toast.error("Coordinate requires 6-digit Pincode.");
    setSettingUp(true);
    try {
      await updateProfile({ pincode: pincodeInput });
      toast.success("Logistics Sector Locked! 🛰️");
    } catch (e) {
      toast.error("Auth server denial.");
    } finally {
      setSettingUp(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!userProfile) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      // Double check availability (Race condition protection)
      const snap = await getDoc(orderRef);
      if (snap.exists() && snap.data().deliveryPartnerId) {
        return toast.error("Package acquired by another operative.");
      }

      await updateDoc(orderRef, {
        deliveryPartnerId: userProfile.uid,
        deliveryPartnerName: userProfile.displayName,
        deliveryStatus: "assigned",
        assignedAt: serverTimestamp()
      });
      toast.success("Order Signal Locked! 🏎️");
    } catch (e) {
      toast.error("Protocol acquisition failure.");
    }
  };

  const handleStatusUpdate = async (order: any) => {
    let next: string = "";
    if (order.deliveryStatus === "assigned") next = "picked";
    else if (order.deliveryStatus === "picked") next = "on-way";
    else if (order.deliveryStatus === "on-way") next = "delivered";

    if (!next) return;

    try {
      const updates: any = { deliveryStatus: next };
      // Master orderStatus synch for customer visibility
      updates.orderStatus = next;
      
      if (next === "delivered") {
        updates.deliveredBy = userProfile?.uid;
        updates.deliveredTime = serverTimestamp();
      }
      await updateDoc(doc(db, "orders", order.id), updates);
      toast.success(`Vector updated to ${next.toUpperCase()}`);
    } catch (e) {
      toast.error("Status sync failed.");
    }
  };

  const tab = pathname.split("/").pop() === "delivery" ? "active" : pathname.split("/").pop() || "active";
  const totalEarnings = history.length * 45;

  if (loading) return (
    <DashboardLayout title="Logistics" items={navItems}>
       <div className="flex flex-col items-center justify-center py-48">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] opacity-60">Syncing Global Dispatch Node...</p>
       </div>
    </DashboardLayout>
  );

  if (!userProfile?.pincode) return (
    <DashboardLayout title="Operative Onboarding" items={navItems}>
       <div className="max-w-xl mx-auto py-12 animate-in zoom-in duration-700">
          <div className="p-12 rounded-[3.5rem] glass-card border border-foreground/5 shadow-premium relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <MapPin className="h-64 w-64 text-primary" />
             </div>
             <div className="flex items-center gap-6 mb-10">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                   <Navigation className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="font-display font-black text-3xl text-foreground tracking-tighter uppercase italic">Vector Registration</h3>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-70">Operational Zone Definition</p>
                </div>
             </div>
             <p className="text-sm text-muted-foreground mb-10 leading-relaxed font-black uppercase tracking-widest opacity-60">
                To initialize the order dispatch stream, please define your operational coordinate (Pincode). You will receive broadcasts for all unassigned shipments within this sector.
             </p>
             <form onSubmit={handlePincodeSetup} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Logistics Pincode</label>
                   <input type="text" maxLength={6} required value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 400001"
                      className="w-full h-16 px-8 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-mono font-black text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/20 shadow-inner" />
                </div>
                <button type="submit" disabled={settingUp}
                   className="w-full h-16 rounded-[2rem] bg-primary text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4">
                   {settingUp ? <Loader2 className="h-5 w-5 animate-spin" /> : <Map className="h-5 w-5" />}
                   <span>Lock Operational Sector</span>
                </button>
             </form>
          </div>
       </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Logistics Dispatch" items={navItems}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: "Live Broadcasts", value: availableOrders.length, color: "text-amber-500", icon: <Bike className="h-6 w-6" /> },
          { label: "Active Haul", value: myOrders.length, color: "text-blue-500", icon: <Package className="h-6 w-6" /> },
          { label: "Total Fulfilled", value: history.length, color: "text-emerald-500", icon: <CheckCircle2 className="h-6 w-6" /> },
          { label: "Fiscal Impact", value: `₹${totalEarnings}`, color: "text-primary", icon: <TrendingUp className="h-6 w-6" /> },
        ].map((s) => (
          <div key={s.label} className="p-10 rounded-[3rem] glass-card border border-foreground/5 shadow-premium relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">{s.icon}</div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className={`p-3 rounded-2xl bg-opacity-10 ${s.color.replace('text-', 'bg-')} ${s.color} shadow-inner`}>{s.icon}</div>
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">{s.label}</span>
            </div>
            <p className={`text-5xl font-display font-black text-foreground italic tracking-tighter relative z-10`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-12 flex-wrap">
        {(["active", "history", "earnings"] as const).map((t) => (
          <button key={t} onClick={() => navigate(t === "active" ? "/dashboard/delivery" : `/dashboard/delivery/${t}`)}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${tab === t ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "glass border-foreground/5 text-muted-foreground hover:border-foreground/10"}`}>
            {t === 'active' ? 'Operations HUB' : t === 'history' ? 'Transaction Logs' : 'Fiscal Analytics'}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-700">
           {/* Available Orders Feed */}
           <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                    Available Signals
                    <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                 </h3>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-1.5 glass border border-foreground/10 rounded-xl opacity-70">Sector: {userProfile.pincode}</span>
              </div>
              {availableOrders.length === 0 && (
                <div className="py-24 text-center glass-card rounded-[3.5rem] border-2 border-dashed border-foreground/10">
                   <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-20" />
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Scanning for available shipments...</p>
                </div>
              )}
              {availableOrders.map(order => (
                <div key={order.id} className="p-10 rounded-[3.5rem] glass-card border border-foreground/5 hover:border-primary/20 transition-all shadow-premium relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-5 transition-all duration-700">
                      <ReceiptText className="h-40 w-40 text-primary" />
                   </div>
                   <div className="flex items-start justify-between mb-8 relative z-10">
                      <div>
                         <h4 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors">{order.restaurantName}</h4>
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 opacity-60">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-display font-black text-foreground italic tracking-tighter">₹{order.totalAmount}</p>
                         <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-80">{order.orderStatus}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-5 rounded-2xl bg-foreground/5 border border-foreground/10 mb-10 relative z-10 shadow-inner">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground line-clamp-1 opacity-70">{order.address}</p>
                   </div>
                   <button onClick={() => handleAcceptOrder(order.id)}
                      className="w-full h-14 rounded-2xl bg-amber-600 text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative z-10">
                      <Package className="h-5 w-5" /> Signal Acquisition
                   </button>
                </div>
              ))}
           </div>

           {/* My Active Orders */}
           <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                    Active Deployment
                    <Sparkles className="h-6 w-6 text-primary" />
                 </h3>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-1.5 glass border border-foreground/10 rounded-xl opacity-70">{myOrders.length} Allocated</span>
              </div>
              {myOrders.length === 0 && (
                <div className="py-24 text-center glass-card rounded-[3.5rem] border-2 border-dashed border-foreground/10">
                   <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-20" />
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">No active shipments in custody.</p>
                </div>
              )}
              {myOrders.map(order => (
                <div key={order.id} className="p-10 rounded-[3.5rem] glass-card border border-indigo-500/20 shadow-premium relative group overflow-hidden bg-indigo-500/5">
                   <div className="flex items-start justify-between mb-8 relative z-10">
                      <div>
                         <h4 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter">{order.restaurantName}</h4>
                         <div className={`mt-3 px-5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] inline-block border ${order.orderStatus === 'picked' ? 'bg-indigo-500 text-white border-indigo-500' : order.orderStatus === 'on-way' ? 'bg-amber-500 text-white border-amber-500' : 'bg-foreground/10 text-muted-foreground border-foreground/10'}`}>
                            {order.orderStatus}
                         </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => toast.info(`Comm Link to ${order.contact}`)} className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-foreground/10 transition-all shadow-sm"><Phone className="h-5 w-5" /></button>
                        <button onClick={() => toast.info("Initializing Map Vector...")} className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-indigo-500 hover:bg-foreground/10 transition-all shadow-sm"><Navigation className="h-5 w-5" /></button>
                      </div>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-foreground/5 border border-foreground/10 mb-10 relative z-10 shadow-inner">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-50">Target Identity</p>
                      <p className="text-sm font-display font-black text-foreground italic tracking-tight">{order.userName}</p>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-foreground/5">
                         <MapPin className="h-4 w-4 text-primary" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground line-clamp-1 opacity-70">{order.address}</p>
                      </div>
                   </div>
                   <button onClick={() => handleStatusUpdate(order)}
                      className="w-full h-16 rounded-[2rem] bg-gradient-hero text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative z-10">
                      <CheckCircle2 className="h-6 w-6" />
                      {order.orderStatus === "assigned" ? "Kernel Acquisition (PICKED)" : order.orderStatus === "picked" ? "Transit Initiation (ON WAY)" : "Finalize Protocol (DELIVERED)"}
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-700">
           {history.map(order => (
             <div key={order.id} className="p-8 rounded-[2.5rem] glass-card border border-foreground/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-premium">
                <div className="flex items-center gap-8">
                   <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner"><Package className="h-7 w-7" /></div>
                   <div>
                      <h4 className="text-lg font-display font-black text-foreground uppercase italic tracking-tighter">{order.restaurantName}</h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">#{order.id.slice(-8).toUpperCase()} · {order.deliveredTime?.toDate ? new Date(order.deliveredTime.toDate()).toLocaleString() : 'Recently'}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-display font-black text-emerald-500 italic tracking-tighter leading-none mb-1">₹45</p>
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Base Compensation</p>
                </div>
             </div>
           ))}
           {history.length === 0 && (
             <div className="py-32 text-center glass-card rounded-[4rem] border-2 border-dashed border-foreground/10 shadow-premium">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-8 opacity-20" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Awaiting historical fulfillment data matrices.</p>
             </div>
           )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
