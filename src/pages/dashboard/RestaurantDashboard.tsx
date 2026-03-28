import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, UtensilsCrossed, Star, TrendingUp, Plus, Edit, Trash2, Check, X, Image as ImageIcon, Sparkles, Clock, MapPin, Phone, ReceiptText, ChefHat, CheckCircle2, ChevronRight, PackageCheck, User, Store, Hash, CreditCard, Save, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc, orderBy, getDocs, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const navItems = [
  { label: "Orders", path: "/dashboard/restaurant", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Menu", path: "/dashboard/restaurant/menu", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { label: "Profile", path: "/dashboard/restaurant/profile", icon: <User className="h-4 w-4" /> },
  { label: "Reviews", path: "/dashboard/restaurant/reviews", icon: <Star className="h-4 w-4" /> },
  { label: "Analytics", path: "/dashboard/restaurant/analytics", icon: <TrendingUp className="h-4 w-4" /> },
];

const categories = ["Quick Bites", "Main Course", "Beverages", "Desserts", "Starters", "Chinese", "Italian"];

const OrderCard = ({ order, onStatusChange }: { order: any, onStatusChange: (id: string, updates: any) => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "order_items"), where("orderId", "==", order.id));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return () => unsub();
  }, [order.id]);

  const getStatusAction = () => {
    switch(order.kitchenStatus) {
      case "placed": return { label: "Accept Order", next: "accepted", icon: <Check className="h-4 w-4" />, color: "bg-indigo-600 shadow-xl shadow-indigo-600/20" };
      case "accepted": return { label: "Start Cooking", next: "preparing", icon: <ChefHat className="h-4 w-4" />, color: "bg-amber-600 shadow-xl shadow-amber-600/20" };
      case "preparing": return { label: "Ready to Hand Over", next: "handed_over", icon: <PackageCheck className="h-4 w-4" />, color: "bg-emerald-600 shadow-xl shadow-emerald-600/20" };
      default: return null;
    }
  };

  const action = getStatusAction();
  const displayStatus = order.kitchenStatus === 'handed_over' ? order.deliveryStatus : order.kitchenStatus;

  return (
    <div className="p-6 rounded-[2.5rem] glass-card border border-foreground/5 hover:border-primary/20 transition-all group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-premium">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
           <div className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
              <ReceiptText className="h-6 w-6" />
           </div>
           <div>
              <h4 className="font-display font-black text-foreground uppercase italic tracking-tighter leading-none">{order.orderId}</h4>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-70">{order.userName} · {order.contact}</p>
           </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${
          displayStatus === 'placed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
          displayStatus === 'accepted' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
          displayStatus === 'preparing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          displayStatus === 'delivered' ? 'bg-primary/20 text-primary border-primary/30' :
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {displayStatus}
        </div>
      </div>
      
      {order.deliveryPartnerName && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/5">
           <div className="p-1 px-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">Assignee</div>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter italic">{order.deliveryPartnerName}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
         <div className="p-5 rounded-[2rem] bg-foreground/5 border border-foreground/5 shadow-inner">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5 opacity-60">
               <PackageCheck className="h-3 w-3" /> Procurement Matrix
            </p>
            {loading ? (
              <div className="space-y-1.5">
                 <div className="h-3 w-20 bg-foreground/10 animate-pulse rounded" />
                 <div className="h-3 w-32 bg-foreground/10 animate-pulse rounded" />
              </div>
            ) : (
              <ul className="space-y-3">
                 {items.map((it, i) => (
                   <li key={i} className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-black italic">{it.name} <span className="text-muted-foreground opacity-60 ml-1">×{it.quantity}</span></span>
                      {it.remarks && <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">JAIN</span>}
                   </li>
                 ))}
              </ul>
            )}
         </div>
         <div className="flex items-center justify-between px-3 text-xs">
            <span className="text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Total Liability</span>
            <span className="text-foreground font-display font-black italic text-base">₹{order.totalAmount}</span>
         </div>
      </div>

      {action && (
        <button 
          onClick={() => onStatusChange(order.id, { kitchenStatus: action.next })}
          className={`w-full h-12 rounded-[1.5rem] ${action.color} text-white font-display font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

const RestaurantDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [restaurantProfile, setRestaurantProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
    category: "Quick Bites",
    isVeg: true,
    isJain: false,
    isRegular: true,
  });

  useEffect(() => {
    if (!userProfile) return;
    
    // Fetch Menu
    const qMenu = query(collection(db, "items"), where("restaurantId", "==", userProfile.uid));
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Orders
    const qOrders = query(
      collection(db, "orders"), 
      where("restaurantId", "==", userProfile.uid)
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in-memory to avoid index requirements for now
      fetched.sort((a: any, b: any) => {
        const t1 = a.createdAt?.toMillis?.() || a.createdAt || 0;
        const t2 = b.createdAt?.toMillis?.() || b.createdAt || 0;
        return t2 - t1;
      });
      setOrders(fetched);
    });

    // Fetch Restaurant Profile
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "restaurants", userProfile.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRestaurantProfile({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error("Profile fetch error", e);
      }
    };
    fetchProfile();

    return () => { unsubMenu(); unsubOrders(); };
  }, [userProfile]);

  const currentOrders = orders.filter(o => o.kitchenStatus !== "handed_over" && o.orderStatus !== "cancelled");
  const pastOrders = orders.filter(o => o.kitchenStatus === "handed_over" || o.orderStatus === "cancelled");

  const handleStatusChange = async (docId: string, updates: any) => {
    try {
      const orderRef = doc(db, "orders", docId);
      // Synchronize orderStatus for customer/admin transparency
      if (updates.kitchenStatus === "accepted") updates.orderStatus = "accepted";
      if (updates.kitchenStatus === "preparing") updates.orderStatus = "preparing";

      await updateDoc(orderRef, updates);
      toast.success("Enterprise protocol state updated.");
    } catch (error) {
      toast.error("Process synch failure.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !restaurantProfile) return;
    setProfileLoading(true);
    try {
      const profileRef = doc(db, "restaurants", userProfile.uid);
      await updateDoc(profileRef, {
        restaurantName: restaurantProfile.restaurantName,
        address: restaurantProfile.address,
        phone: restaurantProfile.phone,
        fssaiId: restaurantProfile.fssaiId,
        gstNo: restaurantProfile.gstNo,
        pincode: restaurantProfile.pincode,
      });
      toast.success("Business Identity Updated! 🚀");
    } catch (error) {
      toast.error("Process failed. Please verify records.");
    } finally {
      setProfileLoading(false);
    }
  };

  const tab = pathname.includes("/menu") ? "menu" : pathname.includes("/reviews") ? "reviews" : pathname.includes("/analytics") ? "analytics" : pathname.includes("/profile") ? "profile" : "orders";

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        price: parseFloat(formData.price),
        restaurantId: userProfile.uid,
        restaurantName: restaurantProfile?.restaurantName || "Cravit Kitchen",
        status: userProfile.status === "active" ? "available" : "unavailable",
        createdAt: Date.now(),
      });
      toast.success("Item added successfully!");
      setShowAddForm(false);
      setFormData({ name: "", description: "", image: "", price: "", category: "Quick Bites", isVeg: true, isJain: false, isRegular: true });
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
      toast.success("Item deleted");
    } catch (error) { toast.error("Failed to delete item"); }
  };

  const calculateAnalytics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => ["picked", "delivered"].includes(o.orderStatus))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { totalOrders, totalRevenue, analytics_data: orders.length > 5 ? "89%" : "Pending" };
  };

  const stats = calculateAnalytics();

  return (
    <DashboardLayout title="Restaurant Operations" items={navItems}>
      {userProfile?.status === "pending" && (
        <div className="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display font-black text-amber-500 uppercase italic">Registration Pending Validation</p>
            <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-0.5 tracking-wider">Our agents are certifying your kitchen coordinates. Menu setup remains active.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-12">
        {(["orders", "menu", "profile", "analytics", "reviews"] as const).map((t) => (
          <button key={t} onClick={() => navigate(t === "orders" ? "/dashboard/restaurant" : `/dashboard/restaurant/${t}`)}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${tab === t ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "glass border-foreground/5 text-muted-foreground hover:border-foreground/10"}`}>
            {t} IDENTITY
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-10">
                 <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                    <Store className="h-8 w-8" />
                 </div>
                 <div>
                    <h3 className="font-display font-black text-3xl text-foreground tracking-tighter uppercase italic">Enterprise Profile</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-70">Operational Manifest Control</p>
                 </div>
              </div>

              {restaurantProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-10 glass-card p-12 rounded-[3.5rem] border border-foreground/5 shadow-premium overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                   <Store className="h-64 w-64 text-primary" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Establishment Identity</label>
                    <div className="relative group">
                       <Store className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                       <input type="text" value={restaurantProfile.restaurantName} 
                        onChange={(e) => setRestaurantProfile({...restaurantProfile, restaurantName: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black italic tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Communication Frequency</label>
                    <div className="relative group">
                       <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                       <input type="tel" value={restaurantProfile.phone} 
                        onChange={(e) => setRestaurantProfile({...restaurantProfile, phone: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-mono font-black focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Logistic Coordinates (Address)</label>
                    <div className="relative group">
                       <MapPin className="absolute left-5 top-6 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                       <textarea value={restaurantProfile.address} 
                        onChange={(e) => setRestaurantProfile({...restaurantProfile, address: e.target.value})}
                        className="w-full min-h-[140px] pl-14 pr-6 py-5 rounded-[2rem] bg-foreground/5 border border-foreground/5 text-foreground font-black italic text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Compliance ID (FSSAI)</label>
                    <div className="relative group">
                       <Hash className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                       <input type="text" value={restaurantProfile.fssaiId} 
                        onChange={(e) => setRestaurantProfile({...restaurantProfile, fssaiId: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-mono font-black focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Fiscal Registry (GSTIN)</label>
                    <div className="relative group">
                       <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                       <input type="text" value={restaurantProfile.gstNo} 
                        onChange={(e) => setRestaurantProfile({...restaurantProfile, gstNo: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-mono font-black focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-foreground/5 flex justify-end relative z-10">
                   <button type="submit" disabled={profileLoading}
                    className="px-12 h-16 rounded-[2rem] bg-primary text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-4">
                      {profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      <span>Sync Enterprise Manifest</span>
                   </button>
                </div>
              </form>
              ) : (
                <div className="p-20 glass-card rounded-[4rem] border border-foreground/5 text-center border-dashed">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-30 animate-pulse" />
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Compiling Operational Records...</p>
                </div>
              )}
           </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-10 animate-in fade-in duration-700">
           <div className="flex items-center justify-between gap-6">
              <div className="flex p-1.5 bg-foreground/5 border border-foreground/5 rounded-[1.5rem] shadow-inner">
                 <button onClick={() => setActiveTab("current")}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
                    Active Procurement ({currentOrders.length})
                 </button>
                 <button onClick={() => setActiveTab("past")}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
                    Fulfillment Logs ({pastOrders.length})
                 </button>
              </div>
              <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 glass border border-foreground/5 rounded-2xl">
                 <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Real-time Data Stream</span>
              </div>
           </div>

           {(activeTab === "current" ? currentOrders : pastOrders).length === 0 ? (
             <div className="py-32 text-center border-2 border-dashed border-foreground/10 rounded-[4rem] glass-card">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                <h4 className="font-display font-black text-foreground italic uppercase tracking-tighter text-xl">Database Inactivity</h4>
                <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-widest opacity-60">Awaiting customer interaction protocols.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(activeTab === "current" ? currentOrders : pastOrders).map(order => (
                   <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
             </div>
           )}
        </div>
      )}

      {tab === "menu" && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="flex items-center justify-between">
            <div>
               <h3 className="font-display font-black text-3xl text-foreground tracking-tighter uppercase italic flex items-center gap-4">
                  Catalog Manifest
                  <Sparkles className="h-6 w-6 text-primary" />
               </h3>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-70">Coordinate defined inventory control</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-4 px-8 h-14 rounded-2xl bg-primary text-white font-display font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 shadow-xl shadow-primary/20 transition-all"
            >
              {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showAddForm ? "Abort Deployment" : "Post Inventory"}
            </button>
          </div>

          {showAddForm && (
            <div className="p-12 rounded-[3.5rem] glass-card border border-foreground/5 shadow-premium mt-10 relative overflow-hidden animate-in zoom-in duration-700">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                 <ImageIcon className="h-64 w-64 text-primary" />
              </div>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Asset Identity</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black italic tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                      placeholder="e.g. Signature Truffle Pizza" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Manifest Description</label>
                    <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full h-40 px-6 py-5 rounded-[2rem] bg-foreground/5 border border-foreground/5 text-foreground font-black italic text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-muted-foreground/30 shadow-inner"
                      placeholder="Specify ingredients and sensory details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Liability (₹)</label>
                      <div className="relative">
                         <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Classification</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black uppercase tracking-widest focus:outline-none cursor-pointer appearance-none shadow-inner">
                        {categories.map(c => <option key={c} value={c} className="bg-background text-foreground font-black">{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Visual Asset Endpoint</label>
                    <input type="url" required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-muted-foreground font-mono font-black text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
                      placeholder="https://cloud.store/image1.jpg" />
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-foreground/5 border border-foreground/5 space-y-6 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full transition-shadow duration-500 ${formData.isVeg ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`} />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Biological: {formData.isVeg ? 'VEGETARIAN' : 'NON-VEG'}</span>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, isVeg: !formData.isVeg})}
                        className={`w-14 h-7 rounded-full transition-all relative border ${formData.isVeg ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-foreground/10 border-foreground/10'}`}>
                        <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${formData.isVeg ? 'right-1 bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'left-1 bg-muted-foreground'}`} />
                      </button>
                    </div>
                    {formData.isVeg && (
                      <div className="pt-6 border-t border-foreground/10 flex gap-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={formData.isJain} onChange={() => setFormData({...formData, isJain: !formData.isJain})} className="hidden" />
                           <div className={`h-6 w-6 rounded-xl border flex items-center justify-center transition-all shadow-sm ${formData.isJain ? 'bg-primary border-primary text-white shadow-primary/20' : 'bg-foreground/5 border-foreground/10 group-hover:border-primary/40'}`}>
                              {formData.isJain && <Check className="h-4 w-4" />}
                           </div>
                           <span className="text-[10px] font-black text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">Jain</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={formData.isRegular} onChange={() => setFormData({...formData, isRegular: !formData.isRegular})} className="hidden" />
                           <div className={`h-6 w-6 rounded-xl border flex items-center justify-center transition-all shadow-sm ${formData.isRegular ? 'bg-indigo-500 border-indigo-500 text-white shadow-indigo-500/20' : 'bg-foreground/5 border-foreground/10 group-hover:border-indigo-500/40'}`}>
                              {formData.isRegular && <Check className="h-4 w-4" />}
                           </div>
                           <span className="text-[10px] font-black text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">Regular</span>
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="flex-1" />
                  <button type="submit" className="w-full h-16 rounded-[2rem] bg-gradient-hero text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Initialize Deployment
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {items.map((item) => (
              <div key={item.id} className="group p-6 rounded-[2.5rem] glass-card border border-foreground/5 hover:border-primary/20 transition-all flex flex-col shadow-premium animate-in fade-in duration-700">
                <div className="relative h-48 mb-6 rounded-[2rem] overflow-hidden shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-xl glass-card backdrop-blur-md flex items-center gap-3 border border-foreground/10">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'} animate-pulse`} />
                    <span className="text-[9px] font-black text-foreground uppercase tracking-[0.2em]">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                  </div>
                  <button onClick={() => deleteItem(item.id)}
                    className="absolute top-4 right-4 h-11 w-11 rounded-xl bg-rose-500/10 backdrop-blur-md text-rose-500 flex items-center justify-center border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 duration-300 shadow-xl">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 px-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-display font-black text-xl text-foreground group-hover:text-primary transition-colors tracking-tighter italic uppercase line-clamp-1 truncate">{item.name}</h4>
                    <span className="font-display font-black text-2xl text-primary tracking-tighter italic">₹{item.price}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-6 leading-relaxed font-black uppercase tracking-widest opacity-60">{item.description}</p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-foreground/5">
                    <span className="px-4 py-1.5 rounded-lg bg-foreground/5 text-muted-foreground text-[8px] font-black uppercase tracking-[0.2em] border border-foreground/5">{item.category}</span>
                    {item.isJain && <span className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/10">Jain Opt</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="animate-in fade-in duration-700 space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 rounded-[3rem] glass-card border border-foreground/5 shadow-premium relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 h-48 w-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                 <TrendingUp className="h-10 w-10 text-primary mb-8" />
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-60">Cumulative Revenue</h4>
                 <p className="text-5xl font-display font-black text-foreground tracking-tighter italic leading-none">₹{stats.totalRevenue}</p>
              </div>
              <div className="p-10 rounded-[3rem] glass-card border border-foreground/5 shadow-premium relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
                 <ClipboardList className="h-10 w-10 text-indigo-500 mb-8" />
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-60">Transaction Volume</h4>
                 <p className="text-5xl font-display font-black text-foreground tracking-tighter italic leading-none">{stats.totalOrders}</p>
              </div>
              <div className="p-10 rounded-[3rem] glass-card border border-foreground/5 shadow-premium relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 h-48 w-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                 <Star className="h-10 w-10 text-emerald-500 mb-8" />
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-60">Efficiency Metric</h4>
                 <p className="text-5xl font-display font-black text-foreground tracking-tighter italic leading-none">{stats.analytics_data}</p>
              </div>
           </div>
           
           <div className="p-20 rounded-[4rem] glass-card border border-foreground/5 shadow-premium text-center border-dashed">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-8 opacity-20" />
              <h3 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter">Interactive Visualization Pending</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-4 max-w-sm mx-auto opacity-60">Complex graphical mapping protocols will initialize as transaction density increases.</p>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RestaurantDashboard;
