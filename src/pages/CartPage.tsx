import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, Tag, ShoppingBag, LogIn, Loader2, Sparkles, Check, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { coupons } from "@/data/mockData";
import Header from "@/components/layout/Header";
import { useState } from "react";
import { toast } from "sonner";

const CartPage = () => {
  const {
    foodItems, instamartItems, updateQuantity, removeItem, clearCart,
    appliedCoupon, applyCoupon, removeCoupon,
    subtotal, deliveryFee, tax, discount, total, loading,
    activeCartType, setActiveCartType, foodCount, instamartCount,
    sharedId, startSharingCart, stopSharingCart, isSharedCart, joinSharedCart, tempName
  } = useCart();
  const { isAuthenticated, userProfile, signInGuest } = useAuth();
  const [couponInput, setCouponInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joiningName, setJoiningName] = useState("");

  const items = activeCartType === 'food' ? foodItems : instamartItems;

  const handleApplyCoupon = () => {
    const c = coupons.find((cp) => cp.code === couponInput.toUpperCase());
    if (!c) { toast.error("Invalid coupon code"); return; }
    if (subtotal < c.minOrder) { toast.error(`Minimum order ₹${c.minOrder}`); return; }
    applyCoupon(c.code);
    toast.success("Coupon applied!");
    setCouponInput("");
  };

  const handleShareCart = async () => {
    const id = await startSharingCart();
    if (id) {
      const shareUrl = `${window.location.origin}/cart?join=${id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleJoin = async () => {
    if (!joiningName.trim()) {
      toast.error("Please enter your name to join.");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      if (!isAuthenticated) {
        await signInGuest();
      }
      await joinSharedCart(joinId, joiningName);
      window.history.replaceState({}, '', window.location.pathname);
      setIsJoining(false);
    }
  };

  // Check for join parameter in URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId && !sharedId) {
      setIsJoining(true);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
           <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">Syncing your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full max-w-[800px] mx-auto pb-20 px-6">
        {/* Toggle Section */}
        <div className="pt-8 pb-4">
           <div className="bg-card/50 border border-foreground/5 p-1.5 rounded-[2rem] flex items-center relative shadow-2xl overflow-hidden backdrop-blur-2xl">
              <div 
                className={`absolute top-1.5 bottom-1.5 rounded-[1.7rem] bg-gradient-to-r transition-all duration-500 ease-out z-0 h-[calc(100%-12px)]`}
                style={{ 
                  left: activeCartType === 'food' ? '6px' : 'calc(50% + 1px)', 
                  width: 'calc(50% - 7px)',
                  background: activeCartType === 'food' ? 'linear-gradient(to right, #6366f1, #4f46e5)' : 'linear-gradient(to right, #10b981, #059669)'
                }}
              />
              <button 
                onClick={() => setActiveCartType('food')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl relative z-10 transition-colors duration-500 font-display font-black text-[10px] uppercase tracking-[0.3em] ${activeCartType === 'food' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                 <ShoppingBag className={`h-4 w-4 transition-transform duration-500 ${activeCartType === 'food' ? 'scale-110' : 'scale-100 opacity-50'}`} />
                 FOOD ({foodCount})
              </button>
              <button 
                onClick={() => setActiveCartType('instamart')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl relative z-10 transition-colors duration-500 font-display font-black text-[10px] uppercase tracking-[0.3em] ${activeCartType === 'instamart' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                 <Sparkles className={`h-4 w-4 transition-transform duration-500 ${activeCartType === 'instamart' ? 'scale-110' : 'scale-100 opacity-50'}`} />
                 GROCERY ({instamartCount})
              </button>
           </div>
        </div>

        <div className="flex items-center gap-4 py-6">
          <Link to="/" className="h-10 w-10 rounded-2xl glass border border-foreground/5 flex items-center justify-center text-foreground hover:border-primary/20 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <h1 className="font-display font-black text-2xl text-foreground tracking-tight uppercase italic">
                {activeCartType === 'food' ? 'Culinary Cart' : 'Grocery Cart'}
             </h1>
             <div className="flex items-center gap-2">
               <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                  {items.length} {items.length === 1 ? 'item' : 'items'} identified
               </p>
               {isSharedCart && (
                 <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                   <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse" /> Shared
                 </span>
               )}
             </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated && !isSharedCart && items.length > 0 && (
              <button 
                onClick={handleShareCart}
                className="h-9 px-4 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
              >
                <Link to="#" className="text-white hover:text-white flex items-center gap-2">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Link>
              </button>
            )}
            {isSharedCart && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/cart?join=${sharedId}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied!");
                  }}
                  className="h-9 px-4 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/30 transition-all flex items-center gap-2"
                >
                  <Share2 className="h-3.5 w-3.5" /> Invite
                </button>
                <button 
                  onClick={() => stopSharingCart()}
                  className="h-9 px-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                  Stop Sharing
                </button>
              </div>
            )}
            {items.length > 0 && (
              <button onClick={() => clearCart(activeCartType)} className="h-9 px-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                Clear
              </button>
            )}
          </div>
        </div>

        {isJoining && (
          <div className="mb-8 p-8 rounded-[2.5rem] glass-card border border-indigo-500/20 backdrop-blur-xl animate-in zoom-in duration-500">
            <h3 className="font-display font-black text-lg text-foreground uppercase italic mb-2">Join Shared Cart</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">You've been invited to add items to this cart. Enter your name to start.</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter your name"
                value={joiningName}
                onChange={(e) => setJoiningName(e.target.value)}
                className="flex-1 h-12 px-6 rounded-2xl bg-foreground/5 border border-foreground/5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
              />
              <button 
                onClick={handleJoin}
                className="px-8 h-12 rounded-2xl bg-indigo-500 text-white font-display font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                Join Now
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="container max-w-md py-20 text-center animate-in zoom-in duration-500">
            <div className="h-24 w-24 glass rounded-[2rem] border border-foreground/5 flex items-center justify-center mx-auto mb-6 shadow-2xl">
               {activeCartType === 'food' ? <ShoppingBag className="h-10 w-10 text-muted-foreground" /> : <Sparkles className="h-10 w-10 text-muted-foreground" />}
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground uppercase tracking-tighter">
               {activeCartType === 'food' ? 'Food Cart Empty' : 'Instamart Empty'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
               {activeCartType === 'food' ? 'Add some delicious items to get started!' : 'Add some essentials to your pantry!'}
            </p>
            <Link to={activeCartType === 'food' ? "/" : "/instamart"} className={`inline-flex mt-8 ${activeCartType === 'food' ? 'bg-primary' : 'bg-accent'} text-white font-display font-black text-xs uppercase tracking-widest px-8 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95`}>
              {activeCartType === 'food' ? 'Browse Food' : 'Shop Groceries'}
            </Link>
          </div>
        ) : (
          <>

        {!isAuthenticated && (
          <div className="mb-8 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                 <LogIn className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">Sign In to Continue</p>
                <p className="text-xs text-amber-500/80 mt-0.5">Please login to save your cart and place the order</p>
              </div>
              <Link to="/login" className="shrink-0 h-10 px-6 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-6 p-5 rounded-[2rem] glass-card border border-foreground/5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="relative w-20 h-20 shrink-0">
                 <img src={item.image} alt={item.name} className="w-full h-full rounded-2xl object-cover border border-white/5 shadow-lg" />
                 <div className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-sm border flex items-center justify-center bg-slate-950 border-white/10">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-base text-foreground truncate">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{item.restaurantName}</p>
                {item.addedBy && (
                   <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">
                      Added by: {item.addedBy}
                   </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                   <p className="text-sm font-black text-foreground">₹{item.price * item.quantity}</p>
                   {item.quantity > 1 && <span className="text-[10px] text-muted-foreground font-bold tracking-tighter">(₹{item.price} × {item.quantity})</span>}
                   {item.remarks === 'jain' && (
                     <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <Sparkles className="h-2.5 w-2.5" /> Jain
                     </span>
                   )}
                </div>
              </div>

              <div className="flex items-center bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden shadow-inner h-9">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-black text-foreground">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all">
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button onClick={() => removeItem(item.id)} className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mt-8 p-6 rounded-[2.5rem] glass-card border border-foreground/5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground">Promotions</span>
          </div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-primary/10 text-primary rounded-2xl px-5 py-3 border border-primary/20 animate-in zoom-in duration-300">
              <div className="flex items-center gap-2">
                 <Check className="h-4 w-4" />
                 <span className="font-black text-xs uppercase tracking-widest">Code "{appliedCoupon}" Active</span>
              </div>
              <button onClick={removeCoupon} className="text-[10px] font-black uppercase text-rose-500 hover:underline">Revoke</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter voucher code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 h-11 px-5 rounded-2xl bg-foreground/5 border border-foreground/5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase font-bold tracking-widest"
              />
              <button 
                onClick={handleApplyCoupon} 
                className="px-8 h-11 rounded-2xl bg-primary text-white font-display font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Claim
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {coupons.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCouponInput(c.code); }}
                className="text-[9px] px-3 py-1.5 rounded-lg border border-foreground/5 bg-foreground/5 text-muted-foreground font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Bill */}
        <div className="mt-8 p-8 rounded-[2.5rem] glass-card border border-foreground/5 shadow-2xl">
          <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Payment Summary</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
               <span className="font-medium">Subtotal</span>
               <span className="font-black text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
               <span className="font-medium">Deliver fee</span>
               <span className={deliveryFee === 0 ? "text-emerald-500 font-black" : "font-black text-foreground"}>
                  {deliveryFee === 0 ? "COMPLIMENTARY" : `₹${deliveryFee}`}
               </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
               <span className="font-medium">Platform Tax (5%)</span>
               <span className="font-black text-foreground">₹{tax}</span>
            </div>
            {discount > 0 && (
               <div className="flex justify-between text-emerald-500">
                  <span className="font-bold">Voucher Discount</span>
                  <span className="font-black">-₹{discount}</span>
               </div>
            )}
            <div className="h-px bg-foreground/10 my-2" />
            <div className="flex justify-between items-center pr-1">
               <span className="font-display font-black text-foreground uppercase tracking-widest">Total Liability</span>
               <span className="font-display font-black text-2xl text-primary tracking-tighter">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div className="mt-10">
          {isAuthenticated ? (
            <Link to="/checkout"
              className="w-full h-14 rounded-3xl bg-gradient-hero text-white font-display font-black text-sm uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center group active:scale-95 shadow-xl shadow-primary/20">
              Transmit Order · ₹{total}
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link to="/login"
              className="w-full h-14 rounded-3xl bg-slate-850 border border-slate-700 text-slate-400 font-display font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center group active:scale-95">
              Authenticate to Order
              <LogIn className="h-4 w-4 ml-2" />
            </Link>
          )}
          <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-6 italic">Secure TLS Checkout Enabled</p>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
