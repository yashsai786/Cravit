import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Store, MapPin, Hash, Phone, CreditCard, ChevronRight } from "lucide-react";

const RestaurantDetails = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    restaurantName: "",
    address: "",
    fssaiId: "",
    pincode: "",
    phone: "",
    gstNo: "",
  });

  useEffect(() => {
    if (!user || userProfile?.role !== "restaurant_owner") {
      navigate("/login");
    }
  }, [user, userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await setDoc(doc(db, "restaurants", user.uid), {
        ...formData,
        userId: user.uid,
        status: "pending",
        createdAt: Date.now(),
      });
      toast.success("Details submitted! Waiting for admin approval.");
      navigate("/profile");
    } catch (error) {
      toast.error("Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-lg z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Restaurant Details</h1>
              <p className="text-slate-400 text-sm">Please provide your business information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Restaurant Name</label>
              <div className="relative group">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required 
                  value={formData.restaurantName} 
                  onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="e.g. Cravit Kitchen / Gourmet Grill" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Restaurant Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <textarea 
                  required 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full min-h-[100px] pl-10 pr-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                  placeholder="Full business address" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">FSSAI ID</label>
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" required 
                    value={formData.fssaiId} 
                    onChange={(e) => setFormData({...formData, fssaiId: e.target.value})}
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="14-digit ID" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Pincode</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" required 
                    value={formData.pincode} 
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="6 digits" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="tel" required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="10-digit mobile" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">GST Number</label>
              <div className="relative group">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required 
                  value={formData.gstNo} 
                  onChange={(e) => setFormData({...formData, gstNo: e.target.value})}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="GSTIN" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 mt-4 rounded-2xl bg-gradient-hero text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : (
                <div className="flex items-center justify-center gap-2">
                  <span>Submit for Approval</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
