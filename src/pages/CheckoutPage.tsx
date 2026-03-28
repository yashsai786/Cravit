import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Banknote, Smartphone, Check, Home, Briefcase, Building2, Loader2, Plus, Info, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

const addressTypes = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: Building2 },
];

const CheckoutPage = () => {
  const { items, subtotal, deliveryFee, tax, discount, total } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    city: "",
    landmark: "",
    pincode: "",
    full: "",
    type: "home"
  });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "address"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(fetched);
      if (fetched.length > 0 && !selectedAddress) {
        setSelectedAddress(fetched[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (formData.pincode.length !== 6) { toast.error("Enter a valid 6-digit pincode"); return; }

    try {
      const docRef = await addDoc(collection(db, "address"), {
        ...formData,
        userId: user.uid,
        createdAt: Date.now(),
      });
      toast.success("Address saved!");
      setSelectedAddress(docRef.id);
      setShowAddressForm(false);
      setFormData({ city: "", landmark: "", pincode: "", full: "", type: "home" });
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  if (!isAuthenticated) { navigate("/login"); return null; }
  if (items.length === 0) { navigate("/cart"); return null; }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="w-full max-w-[800px] mx-auto pb-20 px-6">
        <div className="flex items-center gap-4 pt-10 pb-8">
          <Link to="/cart" className="h-10 w-10 rounded-2xl glass border border-foreground/5 flex items-center justify-center text-foreground hover:border-primary/20 transition-all shadow-premium">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <h1 className="font-display font-black text-2xl text-foreground tracking-tighter uppercase italic">Checkout Matrix</h1>
             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Finalize Coordinates & Logistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Sector: Coordinates */}
          <div className="md:col-span-12 space-y-8">
            <section className="p-8 rounded-[3rem] glass-card border border-foreground/5 shadow-premium relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <MapPin className="h-64 w-64 text-primary" />
               </div>
               
               <div className="flex items-center justify-between mb-10 relative z-10">
                  <div>
                    <h3 className="font-display font-black text-xl text-foreground italic uppercase tracking-tighter">Delivery Coordinates</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-80">Select or identify destination unit</p>
                  </div>
                  <button 
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center gap-2 px-6 h-11 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20 shadow-lg shadow-primary/5"
                  >
                    {showAddressForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddressForm ? "Minimize Form" : "Identify New"}
                  </button>
               </div>

               {showAddressForm ? (
                 <form onSubmit={handleAddAddress} className="space-y-8 animate-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Operational City</label>
                          <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full h-12 px-5 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground text-sm font-black italic focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pincode Protocol</label>
                          <input type="text" required maxLength={6} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, "")})}
                            className="w-full h-12 px-5 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground text-sm font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Coordinate String (House No.)</label>
                       <textarea required value={formData.full} onChange={(e) => setFormData({...formData, full: e.target.value})}
                        className="w-full h-24 px-5 py-4 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground text-sm font-black italic focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Strategic Landmark</label>
                       <input type="text" required value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                        className="w-full h-12 px-5 rounded-2xl bg-foreground/5 border border-foreground/5 text-foreground text-sm font-black italic focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                    </div>
                    <div className="flex flex-wrap gap-4">
                       {addressTypes.map((t) => (
                         <button key={t.id} type="button" onClick={() => setFormData({...formData, type: t.id})}
                           className={`flex items-center gap-2 px-6 h-11 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'glass border-foreground/5 text-muted-foreground hover:border-foreground/20'}`}>
                           <t.icon className="h-4 w-4" /> {t.label}
                         </button>
                       ))}
                    </div>
                    <button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.01] active:shadow-inner transition-all">
                       Capture Coordinate
                    </button>
                 </form>
               ) : (
                 <div className="space-y-6 relative z-10">
                    {loading ? (
                      <div className="flex items-center gap-4 text-muted-foreground p-10 justify-center">
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Querying database sectors...</span>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="py-20 text-center rounded-[3rem] border border-dashed border-foreground/10 bg-foreground/5 shadow-inner">
                         <Info className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">No address manifests identified in your profile</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {addresses.map((addr) => {
                          const TypeIcon = addressTypes.find(t => t.id === addr.type)?.icon || Home;
                          const active = selectedAddress === addr.id;
                          return (
                            <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                              className={`text-left p-6 rounded-[2.5rem] border transition-all group relative ${active ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" : "bg-foreground/5 border-foreground/5 hover:border-foreground/10"}`}>
                              <div className="flex items-start justify-between mb-6">
                                 <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${active ? 'bg-primary text-white' : 'bg-background text-muted-foreground'}`}>
                                    <TypeIcon className="h-5 w-5" />
                                 </div>
                                 {active && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg"><Check className="h-4 w-4" /></div>}
                              </div>
                              <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-2 italic">Sector: {addr.type}</h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-3 font-black uppercase tracking-widest opacity-80">{addr.full}</p>
                              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{addr.city} · {addr.pincode}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                 </div>
               )}
            </section>

            {/* Final Authorization Summary */}
            <section className="p-10 rounded-[3.5rem] glass-card border border-foreground/5 shadow-premium mt-10">
               <h3 className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8 underline decoration-primary/20">Payload Sequence Summary</h3>
               <div className="space-y-4 mb-10">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-foreground font-black text-sm italic uppercase tracking-tighter">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">QUANTITY × {item.quantity}</span>
                      </div>
                      <span className="text-foreground font-display font-black italic">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
               </div>
               <div className="flex items-center justify-between pt-10 border-t border-foreground/10">
                  <div>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opaciy-80">Aggregate Authorization</p>
                     <p className="text-4xl font-display font-black text-primary tracking-tighter italic">₹{total}</p>
                  </div>
                  <button 
                    disabled={!selectedAddress}
                    onClick={() => navigate("/payment", { 
                      state: { 
                        addressId: selectedAddress,
                        addressFull: addresses.find(a => a.id === selectedAddress)?.full + ", " + addresses.find(a => a.id === selectedAddress)?.landmark
                      } 
                    })}
                    className="h-16 px-12 rounded-[2rem] bg-gradient-hero text-white font-display font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Authorize Dispatch
                  </button>
               </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
