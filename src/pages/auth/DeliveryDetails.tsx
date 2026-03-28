import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Bike, MapPin, Hash, Phone, User as UserIcon, ChevronRight } from "lucide-react";

const DeliveryDetails = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    address: "",
    licenseNo: "",
    pincode: "",
    phone: "",
    gender: "male",
  });

  useEffect(() => {
    if (!user || userProfile?.role !== "delivery_partner") {
      navigate("/login");
    }
  }, [user, userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await setDoc(doc(db, "delivery_partners", user.uid), {
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
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-lg z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Delivery Partner Details</h1>
              <p className="text-slate-400 text-sm">Join our delivery network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Current Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <textarea 
                  required 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full min-h-[100px] pl-10 pr-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                  placeholder="Street, City, Landmark" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Driving License</label>
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" required 
                    value={formData.licenseNo} 
                    onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="DL No." 
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
              <label className="text-sm font-medium text-slate-300 ml-1">Gender</label>
              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <select 
                  required 
                  value={formData.gender} 
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                >
                  <option value="male" className="bg-slate-900">Male</option>
                  <option value="female" className="bg-slate-900">Female</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-slate-500 rotate-90" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 mt-4 rounded-2xl bg-gradient-hero text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : (
                <div className="flex items-center justify-center gap-2">
                  <span>Join Our Network</span>
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

export default DeliveryDetails;
