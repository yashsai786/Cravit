import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ShoppingCart, User, ChevronDown, LogOut, LayoutDashboard, ClipboardList, Moon, Sun } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("q", val);
    else params.delete("q");
    navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const dashboardPath = user?.role === "restaurant" ? "/dashboard/restaurant"
    : user?.role === "delivery" ? "/dashboard/delivery"
      : user?.role === "admin" ? "/dashboard/admin"
        : user?.role === "instamart" ? "/dashboard/instamart"
          : null;

  return (
    <header className="sticky top-0 z-50 bg-card shadow-card">
      <div className="w-full max-w-[1720px] mx-auto flex h-16 items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-display font-extrabold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground hidden sm:block">Cravit</span>
        </Link>

        <button className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Bangalore</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search for restaurants and food" value={searchQuery}
              onChange={handleSearch}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link to="/instamart" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            Instamart
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {user?.name[0]}
                </div>
                <span className="hidden sm:inline">{user?.name.split(" ")[0]}</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-elevated border border-border py-1 z-50">
                  <p className="px-3 py-2 text-xs text-muted-foreground border-b border-border">{user?.email}</p>
                  <Link to="/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary">
                    <ClipboardList className="h-4 w-4" /> My Orders
                  </Link>
                  {dashboardPath && (
                    <Link to={dashboardPath} onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  <button onClick={() => { logout(); setShowMenu(false); navigate("/"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-2 border-card">
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
