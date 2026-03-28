import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, RotateCcw, Star, ChevronRight, Loader2, ShoppingBag, Clock, MapPin, ReceiptText, Mail, Phone, CreditCard } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  placed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  accepted: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  preparing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  picked: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const OrderItemSummary = ({ orderDocId }: { orderDocId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "order_items"), where("orderId", "==", orderDocId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderDocId]);

  if (loading) return <div className="h-4 w-24 bg-slate-800 animate-pulse rounded" />;
  
  return (
    <p className="text-xs text-slate-400 font-medium leading-relaxed">
      {items.map((i: any) => `${i.name} × ${i.quantity}`).join(", ") || "No items recorded"}
    </p>
  );
};

const OrdersPage = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderId?.toLowerCase().includes(search.toLowerCase()) || 
                         o.paymentMethod?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleReorder = async (order: any) => {
    try {
      const q = query(collection(db, "order_items"), where("orderId", "==", order.id));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => doc.data());

      items.forEach((item: any) => {
        addItem({
          id: item.itemId,
          name: item.name,
          price: item.price,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80",
          description: "Previously ordered item",
        }, order.restaurantId || "r1", order.restaurantName || "Cravit Kitchen", item.remarks);
      });
      toast.success("Past favorites added to cart!");
    } catch (error) {
      toast.error("Could not retrieve past items");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Header />
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Retrieving History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <main className="w-full max-w-[800px] mx-auto pb-20 px-6">
        <div className="flex items-center justify-between pt-10 pb-8">
           <div>
              <h1 className="font-display font-black text-3xl text-white tracking-tight uppercase italic flex items-center gap-3">
                 History Logs
                 <Clock className="h-6 w-6 text-primary" />
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Split-Collection Transaction Mapping</p>
           </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <input 
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold tracking-tight"
              placeholder="Search by Order ID or Payment..." 
            />
          </div>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-400 uppercase tracking-widest focus:outline-none cursor-pointer hover:border-primary/30 transition-all"
          >
            <option value="all">All Logs</option>
            <option value="delivered">Fulfilled</option>
            <option value="preparing">Active</option>
            <option value="cancelled">Voided</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filtered.map((order, i) => (
            <div 
              key={order.id}
              className="group relative p-6 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl hover:border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-6 duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5 shadow-xl">
                      <ReceiptText className="h-7 w-7 text-primary" />
                   </div>
                   <div>
                      <h3 className="font-display font-black text-lg text-white group-hover:text-primary transition-colors tracking-tight uppercase italic">{order.orderId}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <Clock className="h-3 w-3" />
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "Recently"}
                         </div>
                         <span className="hidden sm:inline h-1 w-1 rounded-full bg-slate-800" />
                         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <CreditCard className="h-3 w-3" />
                            {order.paymentMethod}
                         </div>
                      </div>
                   </div>
                </div>
                <div className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${statusColors[order.orderStatus || 'placed']}`}>
                  {order.orderStatus || 'placed'}
                </div>
              </div>
              
              <div className="p-5 rounded-3xl bg-black/30 border border-white/5 mb-6 relative overflow-hidden group/item">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/item:opacity-10 transition-opacity">
                    <ShoppingBag className="h-16 w-16" />
                 </div>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   Itemization Matrix
                 </p>
                 <OrderItemSummary orderDocId={order.id} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-2 border-t border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                       <Mail className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Customer Protocol</p>
                       <p className="text-xs text-slate-400 font-bold truncate max-w-[150px]">{order.customerEmail}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                       <Phone className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Communication Link</p>
                       <p className="text-xs text-slate-400 font-bold">{order.contact}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-6">
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Total Liability</p>
                      <span className="font-display font-black text-2xl text-primary tracking-tighter italic">₹{order.totalAmount}</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.1em] hover:bg-primary transition-all border border-slate-800 shadow-xl active:scale-95 group"
                   >
                    <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:rotate-[-120deg]" /> 
                    Repurchase
                   </button>
                   <Link to={`/order/${order.id}`} className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-primary/20 transition-all shadow-2xl">
                      <ChevronRight className="h-5 w-5" />
                   </Link>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in zoom-in duration-700">
               <div className="w-64 h-64 relative mb-10">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
                  <img 
                    src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-illustration-download-in-svg-png-gif-formats--shopping-bag-no-items-state-pack-user-interface-illustrations-4644458.png" 
                    alt="Empty history" 
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]"
                  />
               </div>
               <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic text-center mb-3">Database Void Detected</h2>
               <p className="text-slate-500 text-center max-w-sm mb-10 leading-relaxed font-medium uppercase tracking-widest text-[10px]">
                 No transaction logs found for this coordinate. Proceed towards primary procurement.
               </p>
               <Link 
                to="/" 
                className="group relative flex items-center gap-3 px-10 py-4 bg-gradient-hero rounded-[2rem] text-white font-display font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 overflow-hidden"
               >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>Initialize Operations</span>
                <ChevronRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
