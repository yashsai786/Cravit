import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

const roles: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "restaurant", label: "Restaurant Owner" },
  { value: "delivery", label: "Delivery Partner" },
  { value: "instamart", label: "Instamart Handler" },
];

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(name, email, password, role);
    if (ok) { toast.success("Account created!"); navigate("/"); }
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
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Create Account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join Cravit today</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${role === r.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full h-10 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
              Create Account
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
