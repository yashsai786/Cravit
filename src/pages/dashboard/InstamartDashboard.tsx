import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Package, TrendingUp, AlertTriangle, ClipboardList, Check, X, Plus, 
  Trash2, Edit3, Calendar, Boxes, Clock, ShoppingCart, User, 
  MapPin, CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle,
  Database, Activity, ShieldCheck, ArrowUpRight, BarChart3, Settings2,
  Zap, Navigation, Bike
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, 
  addDoc, deleteDoc, serverTimestamp, getDocs, orderBy, setDoc, getDoc
} from "firebase/firestore";
import { toast } from "sonner";
import { instamartItems as initialItems, instamartCategories } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Inventory Grid", path: "/dashboard/instamart", icon: <Database className="h-4 w-4" /> },
  { label: "Dispatch Stream", path: "/dashboard/instamart/orders", icon: <Activity className="h-4 w-4" /> },
  { label: "Matrix Analytics", path: "/dashboard/instamart/analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const InstamartDashboard = () => {
  const { userProfile } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [showStoreSetup, setShowStoreSetup] = useState(false);

  const [storeFormData, setStoreFormData] = useState({
    name: "",
    address: "",
    pincode: userProfile?.pincode || ""
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    stock: "",
    image: "",
    expiryDate: ""
  });

  // Sync Store Data
  useEffect(() => {
    if (!userProfile?.uid) return;
    
    const q = query(collection(db, "instamart_stores"), where("ownerId", "==", userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setShowStoreSetup(true);
        setLoading(false);
      } else {
        const storeData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setStore(storeData);
        setShowStoreSetup(false);
        // Once we have store, fetching inventory will happen in another useEffect
      }
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Sync Inventory
  useEffect(() => {
    if (!store?.id) return;

    const q = query(
      collection(db, "instamart_inventory"), 
      where("storeId", "==", store.id),
      orderBy("name")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
      setLoading(false);
      
      if (snapshot.empty && items.length === 0) {
        // Option to pre-fill? User said fetch original, so maybe and only if they want
        // initializeInventory(store.id); 
      }
    });

    return () => unsubscribe();
  }, [store?.id]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storeData = {
        name: storeFormData.name,
        address: storeFormData.address,
        pincode: storeFormData.pincode,
        ownerId: userProfile!.uid,
        status: "active",
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "instamart_stores"), storeData);
      toast.success("Instamart node established.");
    } catch (error) {
      toast.error("Node synchronization failure.");
    }
  };

  const initializeInventory = async (storeId: string) => {
    const batch = [];
    for (const item of initialItems) {
      const stock = Math.floor(Math.random() * 50) + 5;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 6) + 1);
      
      batch.push(addDoc(collection(db, "instamart_inventory"), {
        name: item.name,
        category: item.category,
        price: Number(item.price),
        unit: item.unit,
        image: item.image,
        stock: stock,
        expiryDate: expiryDate.toISOString(),
        inStock: stock > 0,
        createdAt: serverTimestamp()
      }));
    }
    await Promise.all(batch);
  };

  // Sync Orders
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, "orders"), where("orderType", "==", "instamart"), where("storeId", "==", store.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocalOrders(orders.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });
    return () => unsubscribe();
  }, [store?.id]);

  const tab = pathname.endsWith("/orders") ? "orders" : pathname.endsWith("/analytics") ? "analytics" : "inventory";

  const handleTabChange = (t: string) => {
    if (t === "inventory") navigate("/dashboard/instamart");
    else navigate(`/dashboard/instamart/${t}`);
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      if (status === 'packed') {
        const itemsQ = query(collection(db, "order_items"), where("orderId", "==", id));
        const snap = await getDocs(itemsQ);
        const stockUpdates = snap.docs.map(async (docSnap) => {
          const item = docSnap.data();
          const inventoryId = item.itemId;
          if (inventoryId) {
            const inventoryRef = doc(db, "instamart_inventory", inventoryId);
            try {
              const invDoc = await getDoc(inventoryRef);
              if (invDoc.exists()) {
                const currentStock = invDoc.data().stock || 0;
                const newStock = Math.max(0, Number(currentStock) - Number(item.quantity));
                await updateDoc(inventoryRef, { stock: newStock, inStock: newStock > 0 });
              }
            } catch (err) {
              console.error("Stock error:", err);
            }
          }
        });
        await Promise.all(stockUpdates);
      }

      await updateDoc(doc(db, "orders", id), {
        orderStatus: status,
        kitchenStatus: status === 'packed' ? 'ready' : (status === 'picked' ? 'dispatched' : 'processing'),
      });
      toast.success(`Protocol sequence: ${status.toUpperCase()}`);
    } catch (error) {
      toast.error("Status synchronization failure");
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.stock),
        image: formData.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
        expiryDate: formData.expiryDate,
        inStock: Number(formData.stock) > 0,
        updatedAt: serverTimestamp()
      };

      if (isEditing && currentItem) {
        await updateDoc(doc(db, "instamart_inventory", currentItem.id), itemData);
        toast.success("Inventory matrix updated.");
      } else {
        await addDoc(collection(db, "instamart_inventory"), {
          ...itemData,
          storeId: store.id,
          createdAt: serverTimestamp()
        });
        toast.success("New asset registered.");
      }
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error("Database uplink failure.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Confirm asset decommissioning?")) return;
    try {
      await deleteDoc(doc(db, "instamart_inventory", id));
      toast.success("Asset decommissioned.");
    } catch (error) {
      toast.error("Decommissioning protocol failed.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", price: "", unit: "", stock: "", image: "", expiryDate: "" });
    setIsEditing(false);
    setCurrentItem(null);
  };

  const lowStockItems = items.filter(i => i.stock < 10);
  const totalRevenue = localOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return (
    <DashboardLayout title="Terminal" items={navItems}>
       <div className="flex flex-col items-center justify-center py-48 bg-[#0F172A] min-h-[80vh] rounded-[3rem]">
          <div className="relative">
             <div className="h-24 w-24 rounded-full border-t-2 border-indigo-500 animate-spin" />
             <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500" />
          </div>
          <p className="mt-8 text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Encrypted Datastream...</p>
       </div>
    </DashboardLayout>
  );

  if (showStoreSetup) return (
    <DashboardLayout title="Store Initialization" items={navItems}>
       <div className="flex items-center justify-center py-20 animate-in fade-in duration-700 font-sans">
          <div className="w-full max-w-2xl bg-white rounded-[4rem] p-16 shadow-premium border border-slate-100">
             <div className="h-20 w-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-xl shadow-indigo-600/20">
                <Plus className="h-10 w-10" />
             </div>
             <h1 className="font-display font-black text-4xl text-slate-900 italic uppercase tracking-tighter mb-4">Initialize Store Node</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Protocol: ESTABLISH_LOCAL_HUB_V1.0</p>
             
             <form onSubmit={handleCreateStore} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Establishment Name</label>
                   <input type="text" required placeholder="e.g. Instamart Downtown Hub" value={storeFormData.name} onChange={(e) => setStoreFormData({...storeFormData, name: e.target.value})}
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographical Sector (Pincode)</label>
                      <input type="text" required value={storeFormData.pincode} onChange={(e) => setStoreFormData({...storeFormData, pincode: e.target.value})}
                         className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Coordinate Address</label>
                      <input type="text" required placeholder="Street, Area..." value={storeFormData.address} onChange={(e) => setStoreFormData({...storeFormData, address: e.target.value})}
                         className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" />
                   </div>
                </div>
                <button type="submit" className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-display font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-4">
                   <CheckCircle2 className="h-5 w-5" /> Activate Store Node
                </button>
             </form>
          </div>
       </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Instamart Command" items={navItems}>
      {/* Store Header Info */}
      <div className="mb-10 p-8 rounded-[3rem] bg-gradient-to-r from-slate-900 to-indigo-900 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <MapPin className="h-40 w-40" />
         </div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
               <Database className="h-8 w-8 text-indigo-300" />
            </div>
            <div>
               <h2 className="font-display font-black text-3xl italic uppercase tracking-tighter leading-none">{store?.name}</h2>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                     <MapPin className="h-3 w-3" /> sector: {store?.pincode}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{store?.address}</span>
               </div>
            </div>
         </div>
      </div>
      {/* Upper Management Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-in fade-in duration-1000">
         <div>
            <h1 className="font-display font-black text-4xl text-slate-900 italic uppercase tracking-tighter">Terminal Control</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 bg-slate-100 px-3 py-1 rounded-full inline-block">Node: INSTA_MATRIX_V4.0</p>
         </div>
         <div className="flex gap-3">
            <button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm">
               <Settings2 className="h-5 w-5" />
            </button>
            <button onClick={() => { resetForm(); setShowAddModal(true); }}
               className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/30 hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center gap-3">
               <Plus className="h-4 w-4" /> Register Asset
            </button>
         </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in slide-in-from-bottom-10 duration-700">
        {[
          { label: "Active Assets", value: items.length, change: "+12%", color: "indigo", icon: <Database className="h-5 w-5" /> },
          { label: "Cycle Yield", value: `₹${totalRevenue.toLocaleString()}`, change: "+8.4%", color: "emerald", icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Live Orders", value: localOrders.filter(o => o.orderStatus !== 'delivered').length, change: "Active", color: "amber", icon: <Activity className="h-5 w-5" /> },
          { label: "System Health", value: "99.8%", change: "Optimized", color: "blue", icon: <ShieldCheck className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-premium relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-all group-hover:scale-110 text-slate-900">{s.icon}</div>
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">{s.icon}</div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                   <span className="text-[8px] font-black uppercase text-indigo-500 flex items-center gap-1">
                      <ArrowUpRight className="h-2 w-2" /> {s.change}
                   </span>
                </div>
             </div>
             <p className="text-4xl font-display font-black text-slate-900 tracking-tighter italic">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Smart Alerts Feed */}
      {(lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-in slide-in-from-top-10 duration-700">
           {lowStockItems.length > 0 && (
             <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center gap-6 shadow-sm overflow-hidden relative group">
                <div className="h-16 w-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20 group-hover:scale-110 transition-transform">
                   <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-rose-900 uppercase tracking-tighter italic">Critical Stock Depletion</h4>
                   <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-1 opacity-80">Identify {lowStockItems.length} assets below 10% threshold.</p>
                </div>
                <button onClick={() => handleTabChange('inventory')} className="ml-auto h-10 px-6 rounded-xl bg-rose-900 text-white text-[9px] font-black uppercase tracking-widest">Execute Restock</button>
             </div>
           )}
           <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center gap-6 shadow-sm">
              <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                 <Sparkles className="h-8 w-8" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tighter italic">Optimization Sync</h4>
                 <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1 opacity-80">Matrix efficiency maximized at 94.2% across all sectors.</p>
              </div>
           </div>
        </div>
      )}
      {/* Controls & Tables */}
      <div className="bg-white rounded-[3.5rem] p-4 shadow-premium border border-slate-100 mb-20">
         <div className="flex flex-wrap gap-2 mb-8 p-2">
            {(["inventory", "orders", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => handleTabChange(t)}
                className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all border ${
                   tab === t 
                   ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10" 
                   : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
               }`}>
                {t}
              </button>
            ))}
         </div>

         {/* Inventory Section */}
         {tab === "inventory" && (
            <div className="space-y-10">
               {/* Critical Alerts Row */}
               {lowStockItems.length > 0 && (
                  <div className="px-6 p-8 rounded-[3rem] bg-rose-50 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-700">
                     <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                           <AlertTriangle className="h-8 w-8 animate-pulse" />
                        </div>
                        <div>
                           <h4 className="text-xl font-display font-black text-rose-900 italic uppercase tracking-tighter">Strategic Restock Imminent</h4>
                           <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">{lowStockItems.length} assets identified below critical threshold</p>
                        </div>
                     </div>
                     <div className="flex -space-x-3">
                        {lowStockItems.slice(0, 5).map((item, i) => (
                           <img key={i} src={item.image} className="h-12 w-12 rounded-xl border-2 border-white object-cover shadow-md" alt="" />
                        ))}
                     </div>
                  </div>
               )}

               <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left border-separate border-spacing-y-4 px-4">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                           <th className="pb-4 pl-6">Asset Specification</th>
                           <th className="pb-4">Category Sector</th>
                           <th className="pb-4 text-center">In-Stock Bal</th>
                           <th className="pb-4 text-right">Unit Value</th>
                           <th className="pb-4 pr-6 text-right">Operations</th>
                        </tr>
                     </thead>
                     <tbody className="animate-in fade-in duration-700">
                        {items.map((item) => (
                           <tr key={item.id} className="group bg-slate-50 hover:bg-indigo-50/50 transition-all">
                              <td className="py-5 pl-6 rounded-l-[2rem]">
                                 <div className="flex items-center gap-4">
                                    <img src={item.image} className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-sm transition-transform group-hover:scale-105" alt="" />
                                    <div>
                                       <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{item.name}</p>
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {item.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-5">
                                 <span className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.category}</span>
                              </td>
                              <td className="py-5 text-center">
                                 <div className="flex flex-col items-center">
                                    <span className={`text-lg font-display font-black italic ${item.stock < 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{item.stock}</span>
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                       <div className={`h-full ${item.stock < 10 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (item.stock/50)*100)}%` }} />
                                    </div>
                                 </div>
                              </td>
                              <td className="py-5 text-right">
                                 <p className="text-lg font-display font-black text-slate-900 italic tracking-tight">₹{item.price}</p>
                              </td>
                              <td className="py-5 pr-6 rounded-r-[2rem] text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => {
                                       setFormData({ 
                                          name: item.name, category: item.category, price: String(item.price), 
                                          unit: item.unit, stock: String(item.stock), image: item.image,
                                          expiryDate: item.expiryDate 
                                        });
                                        setCurrentItem(item);
                                        setIsEditing(true);
                                        setShowAddModal(true);
                                    }} className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                                       <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                                       <Trash2 className="h-4 w-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Orders Stream Section */}
         {tab === "orders" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 animate-in fade-in duration-700">
               {localOrders.map((order) => (
                  <div key={order.id} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 relative group overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.01] group-hover:opacity-[0.05] transition-all group-hover:scale-110 pointer-events-none">
                        <ShoppingCart className="h-48 w-48 text-indigo-600" />
                     </div>
                     
                     <div className="flex items-start justify-between mb-10 relative z-10">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-display font-black text-2xl text-slate-900 italic uppercase">Signal #{order.id.slice(-6).toUpperCase()}</h4>
                              <div className={`h-2 w-2 rounded-full ${order.orderStatus === 'delivered' ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse border border-amber-400 shadow-[0_0_10px_#f59e0b]'}`} />
                           </div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{new Date(order.createdAt?.toMillis?.() || Date.now()).toLocaleString()}</p>
                        </div>
                        <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           order.orderStatus === 'picked' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-900 text-white border-slate-900'
                        }`}>
                           {order.orderStatus}
                        </span>
                     </div>

                     <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm mb-10 relative z-10">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm font-black text-slate-900">
                              <span className="uppercase tracking-widest italic opacity-60 text-[9px]">Authorization Limit</span>
                              <span className="text-xl italic tracking-tighter text-indigo-600">₹{order.totalAmount}</span>
                           </div>
                           <div className="h-px bg-slate-50" />
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><User className="h-5 w-5" /></div>
                              <div className="min-w-0">
                                 <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight truncate">{order.userName}</p>
                                 <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em]">{order.contact}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin className="h-5 w-5" /></div>
                              <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase line-clamp-1 opacity-70 tracking-tighter">{order.address}</p>
                           </div>
                        </div>
                     </div>

                     <div className="relative z-10 min-h-[56px]">
                        {order.orderStatus === 'ordered' && (
                           <button onClick={() => updateOrderStatus(order.id, 'packed')}
                              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                              <Zap className="h-5 w-5 text-indigo-400" /> Execute Packing Protocol
                           </button>
                        )}
                        {['packed', 'picked'].includes(order.orderStatus) && (
                           <div className="w-full h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-display font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                              {order.orderStatus === 'packed' ? <Clock className="h-5 w-5 animate-spin" /> : <Bike className="h-5 w-5" />}
                              {order.orderStatus === 'packed' ? "Awaiting Courier Linkage" : "Package In Transit Vector"}
                           </div>
                        )}
                        {order.orderStatus === 'delivered' && (
                           <div className="w-full h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-display font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                              <CheckCircle2 className="h-5 w-5" /> Logic Cycle Fulfilled
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Matrix Analytics Placeholder */}
         {tab === "analytics" && (
            <div className="p-20 text-center animate-in fade-in duration-700">
               <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto mb-8 border border-slate-100 shadow-inner">
                  <BarChart3 className="h-10 w-10" />
               </div>
               <h3 className="font-display font-black text-2xl text-slate-900 uppercase italic tracking-tighter">Analytics Stream Offline</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Data aggregation protocol in progress...</p>
            </div>
         )}
      </div>

      {/* Modern High-End Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000000]/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-xl rounded-[4rem] bg-white border border-slate-100 p-12 shadow-3xl relative animate-in zoom-in duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all"><X className="h-6 w-6" /></button>
              
              <div className="mb-10">
                 <h3 className="font-display font-black text-4xl text-slate-900 uppercase italic tracking-tighter">{isEditing ? "Modify Asset" : "Register Asset"}</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1 bg-indigo-50 px-3 py-1 rounded-full inline-block">Security Clearance: LEVEL_05</p>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Vector</label>
                       <input type="text" required placeholder="Asset name..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector Classification</label>
                       <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer">
                           {instamartCategories.filter(c => c !== "All").map(cat => (
                             <option key={cat} value={cat}>{cat}</option>
                           ))}
                        </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Valuation (₹)</label>
                       <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                       <input type="text" placeholder="kg, pc..." required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Vol</label>
                       <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle Endpoint (Expiry)</label>
                    <input type="date" required value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                       className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Hologram URL</label>
                    <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})}
                       placeholder="https://..."
                       className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" />
                 </div>

                 <button type="submit" className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-display font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                    <Sparkles className="h-5 w-5" />
                    {isEditing ? "Synchronize Matrix" : "Initialize Asset Link"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstamartDashboard;
