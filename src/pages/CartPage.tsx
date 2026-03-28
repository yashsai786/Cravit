import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, Tag, ShoppingBag, LogIn, Loader2, Sparkles, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { coupons } from "@/data/mockData";
import Header from "@/components/layout/Header";
import { useState } from "react";
import { toast } from "sonner";

const CartPage = () => {
  const {
    items, updateQuantity, removeItem, clearCart,
    appliedCoupon, applyCoupon, removeCoupon,
    subtotal, deliveryFee, tax, discount, total, loading
  } = useCart();
  const { isAuthenticated, userProfile } = useAuth();
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = () => {
    const c = coupons.find((cp) => cp.code === couponInput.toUpperCase());
    if (!c) { toast.error("Invalid coupon code"); return; }
    if (subtotal < c.minOrder) { toast.error(`Minimum order ₹${c.minOrder}`); return; }
    applyCoupon(c.code);
    toast.success("Coupon applied!");
    setCouponInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Header />
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
           <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Syncing your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Header />
        <div className="container max-w-md py-20 text-center animate-in zoom-in duration-500">
          <div className="h-24 w-24 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <ShoppingBag className="h-10 w-10 text-slate-600" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tighter">Cart is Empty</h2>
          <p className="text-sm text-slate-500 mt-2">Add some delicious items to get started!</p>
          <Link to="/" className="inline-flex mt-8 bg-primary text-white font-display font-black text-xs uppercase tracking-widest px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <main className="w-full max-w-[800px] mx-auto pb-20 px-6">
        <div className="flex items-center gap-4 pt-8 pb-6">
          <Link to="/" className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:border-primary/20 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <h1 className="font-display font-black text-2xl text-white tracking-tight uppercase italic">Your Cart</h1>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{items.length} items from {items[0].restaurantName}</p>
          </div>
          <button onClick={clearCart} className="ml-auto text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
            Clear Cart
          </button>
        </div>

        {!isAuthenticated && (
          <div className="mb-8 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                 <LogIn className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">Sign In to Continue</p>
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
            <div key={item.id} className="flex items-center gap-6 p-5 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="relative w-20 h-20 shrink-0">
                 <img src={item.image} alt={item.name} className="w-full h-full rounded-2xl object-cover border border-white/5 shadow-lg" />
                 <div className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-sm border flex items-center justify-center bg-slate-950 border-white/10">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-base text-white truncate">{item.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.restaurantName}</p>
                <div className="flex items-center gap-2 mt-2">
                   <p className="text-sm font-black text-white">₹{item.price * item.quantity}</p>
                   {item.quantity > 1 && <span className="text-[10px] text-slate-600 font-bold tracking-tighter">(₹{item.price} × {item.quantity})</span>}
                   {item.remarks === 'jain' && (
                     <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <Sparkles className="h-2.5 w-2.5" /> Jain
                     </span>
                   )}
                </div>
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner h-9">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
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
        <div className="mt-8 p-6 rounded-[2.5rem] bg-slate-900/30 border border-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-slate-500">Promotions</span>
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
                className="flex-1 h-11 px-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase font-bold tracking-widest"
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
                className="text-[9px] px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-500 font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Bill */}
        <div className="mt-8 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800/50 shadow-2xl">
          <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6">Payment Summary</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-slate-400">
               <span className="font-medium">Subtotal</span>
               <span className="font-black text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
               <span className="font-medium">Deliver fee</span>
               <span className={deliveryFee === 0 ? "text-emerald-500 font-black" : "font-black text-white"}>
                  {deliveryFee === 0 ? "COMPLIMENTARY" : `₹${deliveryFee}`}
               </span>
            </div>
            <div className="flex justify-between text-slate-400">
               <span className="font-medium">Platform Tax (5%)</span>
               <span className="font-black text-white">₹{tax}</span>
            </div>
            {discount > 0 && (
               <div className="flex justify-between text-emerald-500">
                  <span className="font-bold">Voucher Discount</span>
                  <span className="font-black">-₹{discount}</span>
               </div>
            )}
            <div className="h-px bg-slate-800 my-2" />
            <div className="flex justify-between items-center pr-1">
               <span className="font-display font-black text-white uppercase tracking-widest">Total Liability</span>
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
          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6 italic">Secure TLS Checkout Enabled</p>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
