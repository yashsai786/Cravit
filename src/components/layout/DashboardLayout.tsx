import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home } from "lucide-react";

interface NavItem { label: string; path: string; icon: React.ReactNode; }

const DashboardLayout: React.FC<{ title: string; items: NavItem[]; children: React.ReactNode }> = ({ title, items, children }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-display font-extrabold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-foreground">{title}</span>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {items.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-border space-y-0.5">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Home className="h-4 w-4" /> Home
          </Link>
          <button onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
        {user && (
          <div className="p-4 border-t border-border">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-50 bg-card shadow-card flex items-center h-14 px-4 gap-3">
          <Link to="/" className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-display font-extrabold text-sm">C</span>
          </Link>
          <span className="font-display font-bold text-foreground flex-1">{title}</span>
          <button onClick={() => { logout(); navigate("/"); }} className="text-destructive"><LogOut className="h-4 w-4" /></button>
        </header>
        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 bg-card border-b border-border">
          {items.map((item) => (
            <Link key={item.path} to={item.path}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${pathname === item.path ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
