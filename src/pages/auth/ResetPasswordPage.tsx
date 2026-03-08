import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Reset link sent! Check your email");
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
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Reset Password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a reset link</p>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-accent font-medium mb-2">✓ Reset link sent</p>
              <p className="text-sm text-muted-foreground">Check your inbox for instructions</p>
              <Link to="/login" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
              </div>
              <button type="submit" className="w-full h-10 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                Send Reset Link
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary font-medium hover:underline">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
