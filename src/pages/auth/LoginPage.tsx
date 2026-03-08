import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-display font-extrabold text-lg">C</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">Cravit</span>
        </Link>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">Welcome back! Enter your credentials</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/reset-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign Up</Link>
          </p>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center mb-2">Demo accounts (password: password)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["customer", "restaurant", "delivery", "instamart", "admin"].map((r) => (
                <button key={r} onClick={() => { setEmail(`${r}@cravit.com`); setPassword("password"); }}
                  className="text-[10px] px-2 py-1 rounded border text-muted-foreground hover:border-primary hover:text-primary transition-colors capitalize">
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
