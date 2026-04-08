import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home, UserCircle, Grid, ShoppingCart, Settings, Moon, Sun } from "lucide-react";

interface NavItem { label: string; path: string; icon: React.ReactNode; }

const DashboardLayout: React.FC<{ title: string; items: NavItem[]; children: React.ReactNode }> = ({ title, items, children }) => {
  const { pathname } = useLocation();
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-500 overflow-hidden">
      {/* Sidebar - Elite Glassmorphism */}
      <aside className="w-72 glass border-r border-foreground/5 shrink-0 hidden md:flex flex-col relative z-20 overflow-hidden h-screen sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="p-10 pb-12 relative z-10">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-display font-black text-xl italic">C</span>
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-foreground tracking-tighter uppercase italic leading-none">{title}</h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">Management Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 relative z-10 overflow-y-auto scrollbar-hide">
          {items.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${active ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}>
                <div className={`transition-transform ${active ? 'scale-110 rotate-12' : ''}`}>{item.icon}</div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 relative z-10">
           <div className="p-6 rounded-[2.5rem] glass-card border border-foreground/5 shadow-premium">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-muted-foreground overflow-hidden shadow-inner">
                    {userProfile?.displayName ? (
                      <span className="font-display font-black text-lg italic">{userProfile.displayName[0]}</span>
                    ) : 'U'}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-black text-foreground truncate italic uppercase tracking-tighter">{userProfile?.displayName || "User"}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate opacity-60">{userProfile?.role?.replace("_", " ")}</p>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <Link to="/" className="h-11 rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shadow-sm"><Home className="h-5 w-5" /></Link>
                 <button onClick={() => setDarkMode(!darkMode)} className="h-11 rounded-xl bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shadow-sm">
                   {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                 </button>
                 <button onClick={() => { logout(); navigate("/"); }} className="h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><LogOut className="h-5 w-5" /></button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Stream */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-700 h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 glass border-b border-foreground/5 flex items-center h-20 px-6 gap-4">
          <Link to="/" className="h-11 w-11 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-black text-lg italic">C</span>
          </Link>
          <div className="flex-1">
             <h2 className="font-display font-black text-lg text-foreground uppercase italic leading-none tracking-tighter">{title}</h2>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-rose-500"><LogOut className="h-5 w-5" /></button>
        </header>

        {/* Mobile Sub-nav */}
        <nav className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide px-6 py-4 glass border-b border-foreground/5 no-scrollbar shrink-0">
          {items.map((item) => (
            <Link key={item.path} to={item.path}
              className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${pathname === item.path ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-foreground/5 text-muted-foreground border border-foreground/5"}`}>
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8 overflow-auto scrollbar-hide bg-background/50">
           <div className="max-w-[1500px] mx-auto animate-in fade-in duration-700">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
