import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle, signInGuest, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      handleRoleRedirect(userProfile.role);
    }
  }, [userProfile]);

  const handleRoleRedirect = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/dashboard/admin");
        break;
      case "restaurant_owner":
        navigate("/dashboard/restaurant");
        break;
      case "delivery_partner":
        navigate("/dashboard/delivery");
        break;
      case "insta_handler":
        navigate("/dashboard/instamart");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back!");
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
    } catch (error) {
      toast.error("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      await signInGuest();
      toast.success("Welcome, Guest!");
    } catch (error) {
      toast.error("Failed to sign in as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <Link to="/" className="flex items-center gap-3 justify-center mb-10 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-primary-foreground font-display font-extrabold text-xl">C</span>
          </div>
          <span className="font-display font-bold text-3xl text-white tracking-tight">Cravit</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Sign In</h1>
            <p className="text-slate-400 text-sm">Experience the magic of seamless food delivery.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="/reset-password" id="forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Forgot password?</Link>
              </div>
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
              id="login-button"
              className="w-full h-12 mt-2 rounded-2xl bg-gradient-hero text-primary-foreground font-display font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 hover:translate-y-[-1px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </div>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Or continue with</span>
            <div className="h-[1px] flex-1 bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button 
              onClick={handleGuestSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-all"
            >
              <LogIn className="h-5 w-5 text-slate-400" />
              <span>Guest</span>
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
