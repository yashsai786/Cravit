import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { User, Mail, Calendar, Shield, BadgeCheck, LogOut, ArrowLeft, ClipboardList, ChevronRight, Edit3, Save, X, Phone, Store, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const Profile = () => {
  const { userProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedContact, setEditedContact] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditedName(userProfile.displayName || "");
      setEditedContact(userProfile.contact || "");
      
      if (userProfile.role === "restaurant_owner") {
        fetchRestaurant();
      }
    }
  }, [userProfile]);

  const fetchRestaurant = async () => {
    if (!userProfile) return;
    try {
      const resDoc = await getDoc(doc(db, "restaurants", userProfile.uid));
      if (resDoc.exists()) {
        setRestaurantName(resDoc.data().restaurantName);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        displayName: editedName,
        contact: editedContact,
        updatedAt: Date.now(),
      });
      toast.success("Identity updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to sync changes");
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Not Logged In</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile details.</p>
          <Link to="/login" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(userProfile.createdAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-700">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="glass-card border border-foreground/5 rounded-[3rem] overflow-hidden shadow-premium relative">
          <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
          
          <div className="px-8 pb-10">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-10">
              <div className="h-32 w-32 rounded-[2.5rem] bg-background p-1 border-8 border-card shadow-premium overflow-hidden group">
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt="User" className="h-full w-full object-cover rounded-[1.8rem]" />
                ) : (
                  <div className="h-full w-full bg-gradient-hero flex items-center justify-center text-4xl font-display font-black text-white uppercase rounded-[1.8rem]">
                    {userProfile.displayName ? userProfile.displayName[0] : (userProfile.email ? userProfile.email[0] : "U")}
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left pt-4 sm:pt-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-2">
                  <h1 className="text-3xl font-display font-black text-foreground italic tracking-tight underline decoration-primary/30 decoration-4">
                    {userProfile.displayName || "Unidentified Associate"}
                  </h1>
                  <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-primary/20 shadow-sm">
                    <BadgeCheck className="h-3 w-3" />
                    {userProfile.role.replace("_", " ")}
                  </span>
                </div>
                {restaurantName && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-display font-black italic text-sm mb-2 uppercase tracking-tighter">
                    <Store className="h-4 w-4" />
                    <span>{restaurantName}</span>
                  </div>
                )}
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{userProfile.email}</p>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-foreground/5 border border-foreground/5 hover:border-primary/40 text-foreground transition-all font-black text-[10px] uppercase tracking-widest shadow-premium">
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                     <button onClick={handleUpdate} disabled={loading}
                      className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Protocol
                    </button>
                    <button onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-foreground/10 text-foreground transition-all font-black text-[10px] uppercase tracking-widest border border-foreground/5">
                      <X className="h-4 w-4" /> Abort
                    </button>
                  </div>
                )}
                <button onClick={() => logout()}
                  className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-premium">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-10 border-t border-foreground/5">
              <div className="md:col-span-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Identity Registry */}
                  <div className="p-8 rounded-[2.5rem] bg-foreground/5 border border-foreground/5 shadow-premium group hover:border-primary/20 transition-all">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">Identity Registry</h3>
                    {isEditing ? (
                      <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Visible Moniker</label>
                           <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)}
                             className="w-full h-12 px-6 rounded-xl bg-background border border-foreground/10 text-foreground text-sm font-black italic focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Comms Sector (Mobile)</label>
                           <input type="tel" value={editedContact} onChange={(e) => setEditedContact(e.target.value)}
                             className="w-full h-12 px-6 rounded-xl bg-background border border-foreground/10 text-foreground text-sm font-mono font-black focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-background/40 border border-foreground/5 transition-all group/item hover:border-primary/20">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-lg shadow-primary/5">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-0.5">Operative Status</p>
                            <p className="text-sm font-black text-foreground italic">{userProfile.displayName || "Unknown Identity"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-background/40 border border-foreground/5 transition-all group/item hover:border-emerald-500/20">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-lg shadow-emerald-500/5">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-0.5">Logistics Link</p>
                            <p className="text-sm font-black text-foreground italic font-mono">{userProfile.contact || "Pending Encryption"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Permission Hierarchy */}
                  <div className="p-8 rounded-[2.5rem] bg-foreground/5 border border-foreground/5 shadow-premium group hover:border-primary/20 transition-all">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">Permission Hierarchy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-background/40 border border-foreground/5 transition-all group/item hover:border-blue-500/20">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all shadow-lg shadow-blue-500/5">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-0.5">Clearance Level</p>
                          <p className="text-sm font-black text-foreground uppercase tracking-tighter italic">{userProfile.role.replace("_", " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-background/40 border border-foreground/5 transition-all group/item hover:border-amber-500/20">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-white transition-all shadow-lg shadow-amber-500/5">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-0.5">Access Date</p>
                          <p className="text-sm font-black text-foreground italic">{formattedDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactical Shortcuts */}
                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-premium relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Sparkles className="h-48 w-48 text-primary" />
                   </div>
                   <div className="relative z-10">
                      <h3 className="text-xl font-display font-black text-foreground italic tracking-tight mb-4 uppercase underline decoration-primary/30">Tactical Shortcuts</h3>
                      <p className="text-[10px] text-muted-foreground max-w-sm mb-10 leading-relaxed font-black uppercase tracking-widest opacity-80">Execute specific operational triggers based on your assigned clearance level.</p>
                      
                      <div className="flex flex-wrap gap-4">
                         {userProfile.role === "restaurant_owner" && (
                           <Link to="/dashboard/restaurant" className="px-10 py-4 bg-primary text-white rounded-2xl font-display font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                              Restaurant Terminal
                           </Link>
                         )}
                         {userProfile.role === "delivery_partner" && (
                           <Link to="/dashboard/delivery" className="px-10 py-4 bg-primary text-white rounded-2xl font-display font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                              Logistic HUD
                           </Link>
                         )}
                         <Link to="/orders" className="px-10 py-4 bg-foreground/5 text-foreground rounded-2xl font-display font-black text-[10px] uppercase tracking-widest border border-foreground/10 hover:bg-foreground/10 transition-all flex items-center gap-3 shadow-premium">
                            Transaction Logs <ChevronRight className="h-3 w-3 text-primary" />
                         </Link>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
