import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ShoppingCart, User, ChevronDown, LogOut, LayoutDashboard, ClipboardList, Moon, Sun, Check, MapPin as MapPinIcon, Utensils } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Header = () => {
  const { itemCount } = useCart();
  const { userProfile, loading, logout, updateProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincode, setPincode] = useState(userProfile?.pincode || "");
  const [isLocating, setIsLocating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.pincode) setPincode(userProfile.pincode);
  }, [userProfile?.pincode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("q", val);
    else params.delete("q");
    navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleUpdatePincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      toast.error("Format requires 6-digit Pincode.");
      return;
    }
    try {
      await updateProfile({ pincode });
      toast.success("Location Updated!");
      setShowLocationModal(false);
    } catch (error) {
      toast.error("Failed to update location.");
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    const toastId = toast.loading("Locating you...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=2450fe31902a4a8089745a173fab7e18&language=en&pretty=1`);
          const data = await res.json();
          const postcode = data.results[0]?.components?.postcode;
          if (postcode) {
            setPincode(postcode);
            toast.success("Location detected! Pincode: " + postcode, { id: toastId });
          } else {
            toast.error("Failed to detect postcode", { id: toastId });
          }
        } catch (error) {
          toast.error("Failed to connect to location service", { id: toastId });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error("Location access denied", { id: toastId });
        setIsLocating(false);
      }
    );
  };

  const dashboardPath = userProfile?.role === "restaurant_owner" ? "/dashboard/restaurant"
    : userProfile?.role === "delivery_partner" ? "/dashboard/delivery"
      : userProfile?.role === "admin" ? "/dashboard/admin"
        : userProfile?.role === "insta_handler" ? "/dashboard/instamart"
          : userProfile?.role === "dineout_owner" ? "/dashboard/dineout"
            : null;

  return (
    <header className="sticky top-0 z-50 glass border-b border-foreground/5 shadow-premium">
      <div className="w-full max-w-[1720px] mx-auto flex h-20 items-center gap-6 px-8">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-display font-black text-xl italic">C</span>
          </div>
          <span className="font-display font-black text-2xl text-foreground hidden sm:block tracking-tighter italic uppercase">Cravit</span>
        </Link>

        <div className="relative shrink-0">
          <button 
            onClick={() => setShowLocationModal(!showLocationModal)}
            className="flex items-center gap-3 group transition-all p-2 rounded-2xl hover:bg-foreground/5 hover:backdrop-blur-md"
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/10">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-none gap-1">
              <span className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em]">Your Location</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground italic tracking-tight">
                  {userProfile?.pincode || "Add Location"}
                </span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showLocationModal ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {showLocationModal && (
            <>
              <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowLocationModal(false)}></div>
              <div className="absolute left-0 top-full mt-4 w-80 p-8 glass-card rounded-[2.5rem] z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="font-display font-black text-xl text-foreground mb-2 italic uppercase tracking-tight">Set Location</h3>
                <p className="text-[10px] text-muted-foreground mb-6 font-bold uppercase tracking-widest leading-relaxed">Deliveries and availability will be updated based on your location.</p>
                <form onSubmit={handleUpdatePincode} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Pincode</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. 400001" 
                      value={pincode}
                      maxLength={6}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-14 px-6 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground font-mono font-bold text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="w-full h-12 rounded-3xl bg-foreground/10 text-foreground font-display font-black text-xs uppercase tracking-widest hover:bg-foreground/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      {isLocating ? "Detecting Location..." : "Detect My Location"}
                    </button>

                    <button 
                      type="submit"
                      className="w-full h-12 rounded-3xl bg-primary text-white font-display font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <Check className="h-4 w-4" /> Save
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 max-w-2xl mx-10">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Search for restaurants and food..." value={searchQuery}
              onChange={handleSearch}
              className="w-full h-12 pl-14 pr-6 rounded-2xl bg-foreground/5 border border-transparent focus:bg-foreground/10 focus:border-foreground/10 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none shadow-inner transition-all" />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
            aria-label="Toggle theme">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link to="/instamart" className="hidden lg:flex items-center gap-2 px-6 h-11 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all uppercase tracking-widest italic">
             <LayoutDashboard className="h-4 w-4 text-primary" />
             Instamart
          </Link>

          <Link to="/dineout" className="hidden lg:flex items-center gap-2 px-6 h-11 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all uppercase tracking-widest italic">
             <Utensils className="h-4 w-4 text-primary" />
             Dineout
          </Link>

          {!loading && userProfile ? (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-3xl bg-foreground/5 border border-foreground/5 hover:border-foreground/10 transition-all shadow-lg"
              >
                <div className="h-9 w-9 rounded-2xl bg-gradient-hero flex items-center justify-center overflow-hidden border border-foreground/10 shadow-inner">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="User avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-white uppercase font-display italic">
                      {userProfile.displayName ? userProfile.displayName[0] : "U"}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="text-xs font-black text-foreground italic tracking-tight">
                    {userProfile.displayName ? userProfile.displayName.split(" ")[0] : "User"}
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-1">{userProfile.role.replace("_", " ")}</span>
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-4 w-72 glass-card rounded-[2.5rem] py-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="px-8 py-4 border-b border-foreground/5 mb-2">
                       <p className="font-display font-black text-foreground truncate text-lg italic uppercase tracking-tighter leading-none">{userProfile.displayName || "User"}</p>
                       <p className="text-[10px] text-muted-foreground truncate mt-1 font-bold uppercase tracking-widest">{userProfile.email}</p>
                    </div>
                    
                    <div className="px-4 py-2 space-y-1">
                      {[
                        { label: "Profile", to: "/profile", icon: <User className="h-4 w-4" /> },
                        { label: "Orders", to: "/orders", icon: <ClipboardList className="h-4 w-4" /> },
                      ].map(link => (
                        <Link key={link.to} to={link.to} onClick={() => setShowMenu(false)}
                          className="flex items-center gap-4 px-6 py-3 text-[10px] font-black text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-all rounded-2xl uppercase tracking-widest">
                          {link.icon} {link.label}
                        </Link>
                      ))}
                      
                      {dashboardPath && (
                        <Link to={dashboardPath} onClick={() => setShowMenu(false)}
                          className="flex items-center gap-4 px-6 py-4 text-[10px] font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all rounded-3xl uppercase tracking-widest mt-4 group">
                          <LayoutDashboard className="h-5 w-5 group-hover:rotate-12 transition-transform" /> Dashboard
                        </Link>
                      )}
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-foreground/5 px-4">
                      <button 
                        onClick={() => { logout(); setShowMenu(false); navigate("/"); }}
                        className="w-full flex items-center justify-center gap-3 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-3xl font-display font-black text-[10px] uppercase tracking-widest"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-3 px-8 h-11 rounded-2xl bg-primary text-white hover:scale-105 active:scale-95 transition-all font-display font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all group shadow-lg">
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-[10px] font-black bg-primary text-white border-4 border-background shadow-xl animate-in zoom-in duration-300 rounded-full">
                {itemCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
