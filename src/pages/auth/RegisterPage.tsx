import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Store, Bike, Smartphone, Camera, Loader2, CheckCircle2, Utensils } from "lucide-react";
import { uploadToImageKit } from "@/lib/imagekit";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { signUp, signInWithGoogle, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === "customer") navigate("/");
      else if (userProfile.role === "restaurant_owner") navigate("/register/restaurant-details");
      else if (userProfile.role === "delivery_partner") navigate("/register/delivery-details");
      else if (userProfile.role === "dineout_owner") navigate("/register/dineout-details");
    }
  }, [userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (contact.length < 10) {
      toast.error("Please enter a valid 10-digit contact number");
      return;
    }
    
    setLoading(true);
    const success = await signUp(email, password, name, contact, role, photoURL);
    setLoading(false);
    
    if (success) {
      toast.success("Account created successfully!");
    } else {
      toast.error("Registration failed. Email might already be in use.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Successfully signed up with Google!");
    } catch (error) {
      toast.error("Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading profile picture...");
    try {
      const url = await uploadToImageKit(file, "/profiles");
      if (url) {
        setPhotoURL(url);
        toast.success("Profile picture uploaded", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err) {
      toast.error("File upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 overflow-hidden relative py-12">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-primary-foreground font-display font-extrabold text-xl">C</span>
          </div>
          <span className="font-display font-bold text-3xl text-white tracking-tight">Cravit</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Create Account</h1>
            <p className="text-slate-400 text-sm">Join the Cravit community today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 ml-1">Join as a</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: "customer", label: "Customer", icon: <User className="h-4 w-4" /> },
                    { id: "restaurant_owner", label: "Restaurant", icon: <Store className="h-4 w-4" /> },
                    { id: "delivery_partner", label: "Delivery", icon: <Bike className="h-4 w-4" /> },
                    { id: "dineout_owner", label: "Dineout", icon: <Utensils className="h-4 w-4" /> },
                  ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as UserRole)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      role === r.id 
                        ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10" 
                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {r.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Pic Upload */}
            <div className="flex flex-col items-center justify-center space-y-4 mb-4 animate-in slide-in-from-top-4 duration-700">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-xl shadow-black/20 group-hover:border-primary/50 transition-all">
                  {photoURL ? (
                    <img src={photoURL} alt="Preview" className="h-full w-full object-cover animate-in fade-in zoom-in duration-500" />
                  ) : (
                    <User className="h-10 w-10 text-slate-600 group-hover:text-primary/50 transition-colors" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                   type="file" 
                   id="profile-upload" 
                   accept="image/*" 
                   onChange={handleFileChange} 
                   className="hidden" 
                   disabled={isUploading} 
                />
                <label 
                   htmlFor="profile-upload" 
                   className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                   <Camera className="h-4 w-4" />
                </label>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic tracking-tighter">Profile Picture</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="John Doe" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Contact Number</label>
              <div className="relative group">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="tel" 
                  required 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono tracking-wider"
                  placeholder="9876543210" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPw ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-12 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              id="signup-button"
              className="w-full h-12 mt-2 rounded-2xl bg-gradient-hero text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 hover:translate-y-[-1px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </div>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Or sign up with</span>
            <div className="h-[1px] flex-1 bg-slate-800"></div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
