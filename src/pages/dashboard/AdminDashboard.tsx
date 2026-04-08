import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Store, ShoppingBag, TrendingUp, Shield, ShieldOff, Eye, MessageSquare, Check, X, UserCog, Bike, MapPin, FileCheck, Phone, Star, Edit3, Save, Search, Filter, ChevronRight, Package, ReceiptText, User, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { collection, onSnapshot, doc, updateDoc, query, where, getDoc, getDocs, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserRole, UserStatus } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview", path: "/dashboard/admin", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Accounts", path: "/dashboard/admin/users", icon: <UserCog className="h-4 w-4" /> },
  { label: "Customers", path: "/dashboard/admin/customers", icon: <Users className="h-4 w-4" /> },
  { label: "Restaurants", path: "/dashboard/admin/restaurants", icon: <Store className="h-4 w-4" /> },
  { label: "Delivery", path: "/dashboard/admin/delivery", icon: <Bike className="h-4 w-4" /> },
  { label: "Orders", path: "/dashboard/admin/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Approvals", path: "/dashboard/admin/approvals", icon: <Check className="h-4 w-4" /> },
];

const UserEditModal = ({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: (u: any) => void }) => {
  const [formData, setFormData] = useState({ ...user });
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="glass-card border border-foreground/5 w-full max-w-xl rounded-[3.5rem] p-12 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <UserCog className="h-64 w-64 text-primary" />
        </div>
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h3 className="font-display font-black text-3xl text-foreground tracking-tighter uppercase italic">Edit User</h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-70">Update user profile details</p>
          </div>
          <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"><X className="h-6 w-6" /></button>
        </div>
        
        <div className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Full Name</label>
            <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black italic tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">System Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black uppercase text-[10px] tracking-widest focus:outline-none cursor-pointer appearance-none shadow-inner">
                  {["customer", "restaurant_owner", "delivery_partner", "admin"].map(r => <option key={r} value={r} className="bg-background text-foreground">{r.replace('_', ' ')}</option>)}
                </select>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-black uppercase text-[10px] tracking-widest focus:outline-none cursor-pointer appearance-none shadow-inner">
                  {["active", "pending", "rejected", "banned"].map(s => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
                </select>
             </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-60">Phone/Contact</label>
            <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground font-mono font-black focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner" />
          </div>
        </div>

        <div className="mt-12 flex gap-4 relative z-10">
          <button onClick={() => onSave(formData)} className="flex-1 h-16 rounded-[2rem] bg-primary text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
             <Save className="h-5 w-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailView = ({ order }: { order: any }) => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, "order_items"), where("orderId", "==", order.id));
    getDocs(q).then(snap => setItems(snap.docs.map(doc => doc.data())));
  }, [order.id]);

  return (
    <div className="mt-6 p-6 rounded-[2rem] bg-foreground/5 border border-foreground/5 space-y-4 animate-in slide-in-from-top-2 duration-400 shadow-inner">
       <div className="flex items-center justify-between border-b border-foreground/5 pb-3">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60"><Package className="h-4 w-4" /> Order Details</span>
          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{order.userName}</span>
       </div>
       <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between items-center text-[12px]">
               <span className="font-black italic text-muted-foreground">{it.name} <span className="text-primary/60 ml-2">× {it.quantity}</span></span>
               <span className="font-display font-black text-foreground italic">₹{it.price * it.quantity}</span>
            </li>
          ))}
       </ul>
       <div className="pt-4 border-t border-foreground/5 flex justify-between font-display font-black text-primary text-sm uppercase italic tracking-tighter">
          <span>Total Amount</span>
          <span>₹{order.totalAmount}</span>
       </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Users Stream
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // Orders Stream
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      fetched.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(fetched);
    });

    // Restaurants Detail Sync
    const unsubRestaurants = onSnapshot(collection(db, "restaurants"), (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubUsers(); unsubOrders(); unsubRestaurants(); };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSearch = u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, userSearch, roleFilter]);

  const handleUpdateUser = async (u: any) => {
    try {
      await updateDoc(doc(db, "users", u.uid), {
        displayName: u.displayName,
        role: u.role,
        status: u.status,
        contact: u.contact || ""
      });
      // Also update restaurants/delivery_partners status if exists
      if (u.role === "restaurant_owner" || u.role === "delivery_partner") {
        const col = u.role === "restaurant_owner" ? "restaurants" : "delivery_partners";
        const d = await getDoc(doc(db, col, u.uid));
        if (d.exists()) {
          await updateDoc(doc(db, col, u.uid), { status: u.status });
        }
      }
      setEditingUser(null);
      toast.success("Kernel Data Synchronized!");
    } catch (e) {
      toast.error("Operation Aborted: Write Denial");
    }
  };

  const tab = pathname.split("/").pop() || "overview";

  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeRestaurants: restaurants.filter(r => r.status === "active").length,
    totalOrders: orders.length,
    revenue: orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  }), [users, restaurants, orders]);

  return (
    <DashboardLayout title="Admin Dashboard" items={navItems}>
      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: "Accounts", value: stats.totalUsers, color: "text-blue-500", icon: <Users className="h-6 w-6" /> },
          { label: "Restaurants", value: stats.activeRestaurants, color: "text-emerald-500", icon: <Store className="h-6 w-6" /> },
          { label: "Orders", value: stats.totalOrders, color: "text-amber-500", icon: <ShoppingBag className="h-6 w-6" /> },
          { label: "Revenue", value: `₹${stats.revenue}`, color: "text-rose-500", icon: <TrendingUp className="h-6 w-6" /> },
        ].map((s) => (
          <div key={s.label} className="p-10 rounded-[3rem] glass-card border border-foreground/5 shadow-premium transition-all hover:border-primary/20 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:opacity-5 transition-all duration-700">
               {s.icon}
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className={`p-3 rounded-2xl bg-opacity-10 ${s.color.replace('text-', 'bg-')} ${s.color} shadow-inner`}>
                {s.icon}
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">{s.label}</span>
            </div>
            <p className={`text-5xl font-display font-black text-foreground italic tracking-tighter relative z-10`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-12 flex-wrap">
        {(["overview", "users", "customers", "restaurants", "delivery", "orders", "approvals"] as const).map((t) => (
          <button key={t} onClick={() => navigate(t === "overview" ? "/dashboard/admin" : `/dashboard/admin/${t}`)}
            className={`px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${tab === t ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "glass border-foreground/5 text-muted-foreground hover:border-foreground/10"}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="p-10 rounded-[3.5rem] glass-card border border-foreground/5 shadow-premium">
              <h3 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                 Recent Users
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </h3>
              <div className="space-y-6">
                 {users.slice(0, 5).map(u => (
                   <div key={u.uid} className="flex items-center justify-between p-6 rounded-[2rem] bg-foreground/5 border border-foreground/5 group hover:border-primary/20 transition-all shadow-inner">
                      <div className="flex items-center gap-5">
                         <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-black text-primary uppercase italic text-lg shadow-sm">{u.displayName?.[0] || 'U'}</div>
                         <div>
                            <p className="text-base font-display font-black text-foreground group-hover:text-primary transition-colors tracking-tight italic">{u.displayName || 'Unnamed Entity'}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{u.role}</p>
                         </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase border ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-foreground/5 text-muted-foreground border-foreground/5'}`}>{u.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="p-10 rounded-[3.5rem] glass-card border border-foreground/5 shadow-premium">
              <h3 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                 Recent Orders
                 <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              </h3>
              <div className="space-y-6">
                 {orders.slice(0, 5).map(o => (
                   <div key={o.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-foreground/5 border border-foreground/5 group hover:border-indigo-500/20 transition-all shadow-inner">
                      <div className="flex items-center gap-5">
                         <div className="h-12 w-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center font-black text-muted-foreground text-[10px] shadow-sm">#{o.id.slice(-4).toUpperCase()}</div>
                         <div>
                            <p className="text-base font-display font-black text-foreground italic tracking-tight">{o.restaurantName}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">{o.paymentMethod}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-display font-black text-foreground italic tracking-tighter">₹{o.totalAmount}</p>
                         <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-80">{o.orderStatus}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {(tab === "users" || tab === "customers" || tab === "restaurants" || tab === "delivery") && (
        <div className="space-y-10 animate-in fade-in duration-700">
           {/* Filtering Layer */}
           <div className="flex flex-wrap items-center gap-6 p-8 rounded-[3rem] glass-card border border-foreground/5 shadow-premium">
              <div className="flex-1 relative min-w-[280px]">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                 <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} 
                    placeholder="SEARCH BY NAME OR EMAIL..."
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black uppercase tracking-[0.3em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-inner" />
              </div>
              <div className="flex items-center gap-4 px-6 py-2 bg-foreground/5 rounded-2xl border border-foreground/5">
                 <Filter className="h-5 w-5 text-muted-foreground opacity-50" />
                 <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-10 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground focus:outline-none cursor-pointer appearance-none">
                    <option value="all" className="bg-background text-foreground">UNIVERSAL CLASSIFICATION</option>
                    <option value="customer" className="bg-background text-foreground">CUSTOMER BASE</option>
                    <option value="restaurant_owner" className="bg-background text-foreground">RESTAURANT NODES</option>
                    <option value="delivery_partner" className="bg-background text-foreground">LOGISTICS OPERATIVES</option>
                 </select>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {(tab === "users" ? filteredUsers : users.filter(u => tab === "customers" ? u.role === "customer" : tab === "restaurants" ? u.role === "restaurant_owner" : u.role === "delivery_partner")).map(u => (
                <div key={u.uid} className="group p-10 rounded-[3.5rem] glass-card border border-foreground/5 hover:border-primary/30 transition-all shadow-premium relative overflow-hidden">
                   <div className="flex items-start justify-between relative z-10">
                      <div className="flex gap-8">
                         <div className="h-16 w-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-2xl font-display font-black text-white italic shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
                            {u.displayName?.[0] || 'U'}
                         </div>
                         <div>
                            <h4 className="text-2xl font-display font-black text-foreground italic tracking-tighter group-hover:text-primary transition-colors">{u.displayName || 'Unnamed Entity'}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-70">{u.email}</p>
                            <div className="flex items-center gap-4 mt-6">
                               <span className={`px-5 py-1.5 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase border ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-foreground/5 text-muted-foreground border-foreground/5'}`}>{u.status}</span>
                               <span className="px-5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] italic shadow-inner">{u.role}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={() => setEditingUser(u)} className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-primary transition-all shadow-sm">
                            <Edit3 className="h-5 w-5" />
                         </button>
                      </div>
                   </div>
                   
                   {/* Meta Details Join */}
                   <div className="mt-10 pt-8 border-t border-foreground/5 grid grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Protocol ID</p>
                         <p className="text-[11px] font-mono text-muted-foreground font-bold tracking-tight">{u.uid.slice(0, 20)}...</p>
                      </div>
                      <div className="space-y-2 text-right">
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Operational Zone</p>
                         <p className="text-[11px] font-black text-muted-foreground uppercase italic">{u.pincode || 'HQ Coordinate'}</p>
                      </div>
                   </div>
                   
                   {/* User Specific Transaction Link */}
                   <button onClick={() => { setRoleFilter("all"); setUserSearch(u.email); navigate("/dashboard/admin/orders"); }} className="mt-8 w-full h-12 rounded-2xl bg-foreground/5 border border-dashed border-foreground/10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-3 shadow-inner">
                      <ShoppingBag className="h-4 w-4" /> Inspect Transaction Logs
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-10 animate-in fade-in duration-700">
           <div className="flex flex-wrap items-center gap-6 p-8 rounded-[3rem] glass-card border border-foreground/5 shadow-premium mt-4">
              <div className="flex-1 relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                 <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} 
                    placeholder="SEARCH BY ORDER ID OR EMAIL..."
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black uppercase tracking-[0.3em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-inner placeholder:text-muted-foreground/30" />
              </div>
           </div>

           <div className="space-y-6">
              {orders.filter(o => o.id.toLowerCase().includes(userSearch.toLowerCase()) || o.customerEmail?.toLowerCase().includes(userSearch.toLowerCase())).map(o => (
                <div key={o.id} className="group p-10 rounded-[3.5rem] glass-card border border-foreground/5 hover:border-primary/20 transition-all shadow-premium relative overflow-hidden">
                   <div className="flex flex-wrap items-center justify-between gap-10 relative z-10">
                      <div className="flex items-center gap-8">
                         <div className="h-20 w-20 rounded-[2rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <ReceiptText className="h-10 w-10" />
                         </div>
                         <div>
                            <div className="flex items-center gap-4">
                               <h4 className="font-display font-black text-2xl text-foreground uppercase italic tracking-tighter">#{o.id.slice(-8).toUpperCase()}</h4>
                               <span className={`px-5 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase border ${o.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                 {o.orderStatus}
                               </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                               <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-70"><Store className="h-4 w-4 text-primary" /> {o.restaurantName}</p>
                               <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-70"><User className="h-4 w-4 text-primary" /> {o.userName || o.customerEmail}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="text-right">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 opacity-50">Fiscal Impact</p>
                            <p className="text-4xl font-display font-black text-foreground italic tracking-tighter">₹{o.totalAmount}</p>
                         </div>
                         <button onClick={() => setSelectedOrderId(selectedOrderId === o.id ? null : o.id)} className="h-16 w-16 rounded-[1.5rem] bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-foreground/10 transition-all shadow-sm">
                            {selectedOrderId === o.id ? <X className="h-7 w-7" /> : <Eye className="h-7 w-7" />}
                         </button>
                      </div>
                   </div>
                   {selectedOrderId === o.id && <OrderDetailView order={o} />}
                </div>
              ))}
           </div>
        </div>
      )}

      {tab === "approvals" && (
        <div className="animate-in fade-in duration-700">
           <div className="py-40 text-center glass-card rounded-[4rem] border-2 border-dashed border-foreground/10 shadow-premium">
              <Shield className="h-20 w-20 text-muted-foreground mx-auto mb-10 opacity-[0.05]" />
              <h4 className="font-display font-black text-foreground uppercase tracking-tight text-3xl italic">Approval Queue Synchronized</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-6 opacity-60">Universal clearance protocol awaiting deployment signals.</p>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
