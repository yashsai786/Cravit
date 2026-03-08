import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Banknote, Smartphone, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { mockAddresses, addLocalAddress } from "@/data/mockOrders";
import Header from "@/components/layout/Header";
import { toast } from "sonner";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "cash", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
];

const CheckoutPage = () => {
  const { items, subtotal, deliveryFee, tax, discount, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [localAddresses, setLocalAddresses] = useState(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]?.id || "");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressFull, setNewAddressFull] = useState("");
  const [showNewAddr, setShowNewAddr] = useState(false);

  const handleAddAddress = () => {
    if (!newAddressLabel || !newAddressFull) {
      toast.error("Please fill all fields");
      return;
    }
    const addr = {
      id: `a${Date.now()}`,
      label: newAddressLabel,
      full: newAddressFull,
      lat: 12.97,
      lng: 77.59
    };
    addLocalAddress(addr);
    setLocalAddresses([...mockAddresses]);
    setSelectedAddress(addr.id);
    setShowNewAddr(false);
    setNewAddressLabel("");
    setNewAddressFull("");
    toast.success("Address added!");
  };

  if (items.length === 0) { navigate("/cart"); return null; }
  if (!isAuthenticated) { navigate("/login"); return null; }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="container max-w-2xl pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to="/cart" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="font-display font-bold text-xl text-foreground">Checkout</h1>
        </div>

        {/* Delivery Address */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">Delivery Address</h3>
          </div>
          <div className="space-y-2">
            {localAddresses.map((addr) => (
              <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selectedAddress === addr.id ? "border-primary" : "border-muted-foreground"}`}>
                    {selectedAddress === addr.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-medium text-sm text-foreground">{addr.label}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6 mt-0.5">{addr.full}</p>
              </button>
            ))}
            {showNewAddr ? (
              <div className="space-y-2 mt-2 p-3 rounded-xl bg-secondary/50">
                <input type="text" value={newAddressLabel} onChange={(e) => setNewAddressLabel(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Label (e.g. Grandma's House)" />
                <input type="text" value={newAddressFull} onChange={(e) => setNewAddressFull(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Full Address" />
                <div className="flex gap-2">
                  <button onClick={handleAddAddress}
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Save Address</button>
                  <button onClick={() => setShowNewAddr(false)}
                    className="px-3 h-9 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewAddr(true)} className="text-sm text-primary font-medium hover:underline mt-1">
                + Add new address
              </button>
            )}
          </div>
        </div>

        {/* Payment method selection */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">Payment Method</h3>
          </div>
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${selectedPayment === pm.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                <pm.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">{pm.label}</p>
                  <p className="text-xs text-muted-foreground">{pm.desc}</p>
                </div>
                {selectedPayment === pm.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-foreground py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-foreground"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-foreground"><span>Delivery</span><span className={deliveryFee === 0 ? "text-accent font-medium" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
            <div className="flex justify-between text-foreground"><span>GST (5%)</span><span>₹{tax}</span></div>
            {discount > 0 && <div className="flex justify-between text-accent font-medium"><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-foreground"><span>Total</span><span>₹{total}</span></div>
          </div>
        </div>

        <button onClick={() => navigate("/payment", { state: { addressId: selectedAddress } })}
          className="w-full mt-6 h-12 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center">
          Proceed to Pay · ₹{total}
        </button>
      </main>
    </div>
  );
};

export default CheckoutPage;
