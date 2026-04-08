import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToImageKit } from "@/lib/imagekit";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Utensils, MapPin, DollarSign, Image as ImageIcon, Camera, Loader2, Check } from "lucide-react";

const DineoutDetails = () => {
  const { userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    pincode: "",
    approxCostForTwo: "",
    cuisines: "",
    petFriendly: false,
    latitude: "",
    longitude: "",
  });

  const [restaurantImage, setRestaurantImage] = useState<File | null>(null);
  const [restaurantImagePreview, setRestaurantImagePreview] = useState("");

  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [menuImagePreviews, setMenuImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRestaurantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRestaurantImage(file);
      setRestaurantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    const toastId = toast.loading("Scanning location coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        toast.success("Coordinates acquired successfully!", { id: toastId });
        setIsLocating(false);
      },
      () => {
        toast.error("Failed to acquire coordinates. Please check permissions.", { id: toastId });
        setIsLocating(false);
      }
    );
  };

  const handleMenuImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setMenuImages((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setMenuImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeMenuImage = (index: number) => {
    setMenuImages((prev) => prev.filter((_, i) => i !== index));
    setMenuImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!restaurantImage) {
      toast.error("Please upload a restaurant image.");
      return;
    }
    
    if (formData.pincode.length !== 6) {
      toast.error("Pincode must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving dineout details...");

    try {
      // 1. Upload restaurant image
      const restaurantImageUrl = await uploadToImageKit(restaurantImage, "/dineout_restaurants");
      if (!restaurantImageUrl) throw new Error("Failed to upload restaurant image.");

      // 2. Upload menu images
      const menuImageUrls = await Promise.all(
        menuImages.map((file) => uploadToImageKit(file, "/dineout_menus"))
      );

      // 3. Save to firestore
      const dineoutData = {
        uid: userProfile.uid,
        ...formData,
        approxCostForTwo: Number(formData.approxCostForTwo),
        cuisines: formData.cuisines.split(",").map(c => c.trim()).filter(Boolean),
        restaurantImage: restaurantImageUrl,
        menuImages: menuImageUrls.filter(Boolean),
        status: "active",
        createdAt: Date.now()
      };

      await setDoc(doc(db, "dineout_restaurants", userProfile.uid), dineoutData);
      await updateProfile({ status: "active", pincode: formData.pincode });

      toast.success("Dineout registration successful!", { id: toastId });
      navigate("/"); // Or redirect to a dineout dashboard if we create one
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save details", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 z-10 my-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Dineout Registration</h2>
        <p className="text-slate-400 text-sm mb-8">Set up your physical restaurant presence.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Restaurant Name</label>
              <div className="relative group">
                <Utensils className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" placeholder="The Green House" />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Cost for Two (₹)</label>
              <div className="relative group">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input required type="number" name="approxCostForTwo" value={formData.approxCostForTwo} onChange={handleInputChange} className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" placeholder="900" />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Full Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <textarea required name="address" value={formData.address} onChange={handleInputChange} className="w-full min-h-24 pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors resize-y" placeholder="Full restaurant address" />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Pincode</label>
              <input required name="pincode" value={formData.pincode} onChange={(e) => setFormData(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0,6) }))} className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" placeholder="380001" maxLength={6} />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Map Coordinates</label>
              <button type="button" onClick={handleDetectLocation} disabled={isLocating} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all font-bold text-sm disabled:opacity-50">
                <MapPin className="h-4 w-4" />
                {isLocating ? "Scanning..." : (formData.latitude ? "Coordinates Locked ✓" : "Detect My Location")}
              </button>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Cuisines</label>
              <input required name="cuisines" value={formData.cuisines} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors" placeholder="Continental, Fast Food" />
            </div>
            
            <div className="col-span-2 flex items-center gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <input type="checkbox" id="petFriendly" name="petFriendly" checked={formData.petFriendly} onChange={handleCheckboxChange} className="w-5 h-5 rounded hover:cursor-pointer accent-primary bg-slate-700 border-slate-600" />
              <label htmlFor="petFriendly" className="text-sm font-bold text-white hover:cursor-pointer">Pet Friendly Environment</label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white">Media Uploads</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Main Restaurant Image</label>
              <div className="relative group">
                <div className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${restaurantImagePreview ? 'border-primary/50' : 'border-slate-700 group-hover:border-slate-500'}`}>
                  {restaurantImagePreview ? (
                    <img src={restaurantImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm font-medium">Click to upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleRestaurantImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Menu Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {menuImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-slate-700">
                    <img src={preview} alt={`Menu ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeMenuImage(index)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-sm backdrop-blur-sm">Remove</button>
                  </div>
                ))}
                
                <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-all flex flex-col items-center justify-center relative bg-slate-800/30">
                  <Camera className="h-6 w-6 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400 font-medium px-2 text-center">Add Menu Page</span>
                  <input type="file" accept="image/*" multiple onChange={handleMenuImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full h-14 mt-6 rounded-2xl bg-gradient-hero text-primary-foreground font-display font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving Data...</> : <><Check className="h-5 w-5" /> Complete Registration</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DineoutDetails;
