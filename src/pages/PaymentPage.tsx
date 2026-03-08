import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, Check, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { addLocalOrder, mockAddresses } from "@/data/mockOrders";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm", fields: ["upi_id"] },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay", fields: ["card_number", "expiry", "cvv"] },
  { id: "cash", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered", fields: [] },
];

const PaymentPage = () => {
  const { total, clearCart, items, subtotal, deliveryFee, tax, discount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (total === 0) { navigate("/cart"); return null; }

  const handlePay = () => {
    if (selected === "upi" && !upiId) { toast.error("Enter UPI ID"); return; }
    if (selected === "card" && (!cardNumber || !expiry || !cvv)) { toast.error("Fill all card details"); return; }

    setProcessing(true);

    // Get address from state or default
    const addressId = location.state?.addressId || "a1";
    const address = mockAddresses.find(a => a.id === addressId)?.full || "Address not found";

    const newOrder: any = {
      id: `ORD${Math.floor(Math.random() * 9000) + 1000}`,
      customerId: "u1",
      restaurantId: items[0]?.restaurantId || "r1",
      restaurantName: items[0]?.restaurantName || "Restaurant",
      deliveryPartnerId: "u3",
      deliveryPartnerName: "Amit Kumar",
      items: items.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
      subtotal,
      tax,
      deliveryFee,
      discount,
      total,
      paymentMethod: selected.toUpperCase(),
      paymentStatus: "paid",
      orderStatus: "placed",
      timeline: [
        { status: "placed", time: new Date().toLocaleTimeString(), description: "Order placed successfully" }
      ],
      createdAt: new Date().toISOString(),
      deliveryAddress: address,
    };

    setTimeout(() => {
      addLocalOrder(newOrder);
      clearCart();
      toast.success("Order Placed Successfully! 🍽️");
      navigate(`/order/${newOrder.id}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-lg pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to="/checkout" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="font-display font-bold text-xl text-foreground">Payment</h1>
        </div>

        {/* Amount */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4 text-center">
          <p className="text-xs text-muted-foreground">Amount to Pay</p>
          <p className="text-3xl font-display font-extrabold text-foreground">₹{total}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-4">
          {paymentMethods.map((pm) => (
            <button key={pm.id} onClick={() => setSelected(pm.id)}
              className={`w-full p-4 rounded-xl border transition-colors text-left ${selected === pm.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}>
              <div className="flex items-center gap-3">
                <pm.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{pm.label}</p>
                  <p className="text-xs text-muted-foreground">{pm.desc}</p>
                </div>
                {selected === pm.id && <Check className="h-4 w-4 text-primary" />}
              </div>
            </button>
          ))}
        </div>

        {/* Payment form */}
        {selected === "upi" && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">UPI ID</label>
            <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi" className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        )}

        {selected === "card" && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Card Number</label>
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456" maxLength={19}
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Expiry</label>
                <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY" maxLength={5}
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">CVV</label>
                <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)}
                  placeholder="•••" maxLength={4}
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </div>
        )}

        {selected === "cash" && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4">
            <p className="text-sm text-muted-foreground">Pay ₹{total} in cash when your order is delivered.</p>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Secured by 256-bit encryption</span>
        </div>

        <button onClick={handlePay} disabled={processing}
          className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : `Pay ₹${total}`}
        </button>
      </main>
    </div>
  );
};

export default PaymentPage;
