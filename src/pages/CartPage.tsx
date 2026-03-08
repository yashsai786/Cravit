import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, Tag, ShoppingBag, LogIn } from "lucide-react";
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
    subtotal, deliveryFee, tax, discount, total,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = () => {
    const c = coupons.find((cp) => cp.code === couponInput.toUpperCase());
    if (!c) { toast.error("Invalid coupon code"); return; }
    if (subtotal < c.minOrder) { toast.error(`Minimum order ₹${c.minOrder}`); return; }
    applyCoupon(c.code);
    toast.success("Coupon applied!");
    setCouponInput("");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="container max-w-md py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display font-bold text-xl text-foreground mt-4">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-1">Add some delicious items to get started</p>
          <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to="/" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="font-display font-bold text-xl text-foreground">Cart</h1>
          <button onClick={clearCart} className="ml-auto text-xs text-destructive font-medium hover:underline">
            Clear all
          </button>
        </div>

        {/* Guest login prompt */}
        {!isAuthenticated && (
          <div className="mb-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Please sign in to place your order</p>
                <p className="text-xs text-muted-foreground mt-0.5">You can browse and add items, but login is required to checkout</p>
              </div>
              <Link to="/login" className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card animate-fade-in">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.restaurantName}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">₹{item.price * item.quantity}</p>
              </div>
              <div className="flex items-center gap-0.5 bg-secondary rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-foreground hover:text-primary">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-2 text-sm font-bold text-foreground">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-foreground hover:text-primary">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mt-6 p-4 rounded-xl bg-card shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Apply Coupon</span>
          </div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-accent/10 text-accent rounded-lg px-3 py-2">
              <span className="font-bold text-sm">{appliedCoupon} applied</span>
              <button onClick={removeCoupon} className="text-xs font-medium text-destructive">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleApplyCoupon} className="px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Apply
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {coupons.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCouponInput(c.code); }}
                className="text-[10px] px-2 py-1 rounded border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {c.code} — {c.description}
              </button>
            ))}
          </div>
        </div>

        {/* Bill */}
        <div className="mt-6 p-4 rounded-xl bg-card shadow-card">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-foreground"><span>Item Total</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-foreground"><span>Delivery Fee</span><span className={deliveryFee === 0 ? "text-accent font-medium" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
            <div className="flex justify-between text-foreground"><span>GST (5%)</span><span>₹{tax}</span></div>
            {discount > 0 && <div className="flex justify-between text-accent font-medium"><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-foreground"><span>To Pay</span><span>₹{total}</span></div>
          </div>
        </div>

        {/* Checkout */}
        {isAuthenticated ? (
          <Link to="/checkout"
            className="w-full mt-6 h-12 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center">
            Proceed to Checkout · ₹{total}
          </Link>
        ) : (
          <Link to="/login"
            className="w-full mt-6 h-12 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center">
            Sign In to Place Order
          </Link>
        )}
      </main>
    </div>
  );
};

export default CartPage;
