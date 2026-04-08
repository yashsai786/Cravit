import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, Check, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm", fields: ["upi_id"] },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay", fields: ["card_number", "expiry", "cvv"] },
  { id: "cash", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered", fields: [] },
];

const PaymentPage = () => {
  const { total, clearCart, currentItems: items, subtotal, deliveryFee, tax, discount } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (total === 0) { navigate("/cart"); return null; }

  const handlePay = async () => {
    if (!user) { toast.error("User not authenticated"); return; }
    
    // COD selection
    if (selected === "cash") {
      executeOrder();
      return;
    }

    // Razorpay Integration for Online Payments
    setProcessing(true);
    
    const options = {
      key: "rzp_test_SaESeZ2yq0rqPc",
      amount: total * 100, // Amount in paise
      currency: "INR",
      name: "Cravit — Don't Wait, Grab It",
      description: "Secure Digital Culinary Procurement",
      image: "/cravit.png",
      handler: function (response: any) {
        console.log("Payment Successful", response);
        toast.success("Transaction Authorized: " + response.razorpay_payment_id);
        executeOrder();
      },
      prefill: {
        name: userProfile?.displayName || "",
        email: user.email || "",
        contact: userProfile?.contact || "",
      },
      notes: {
        address: location.state?.addressFull || "Default",
      },
      theme: {
        color: "#6366f1", // Indigo-600
      },
      modal: {
        ondismiss: function() {
          setProcessing(false);
          toast.error("Transaction Aborted by Operative");
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay trigger failure", err);
      toast.error("Payment Gateway Protocol Failure");
      setProcessing(false);
    }
  };

  const executeOrder = async () => {
    setProcessing(true);

    try {
      const addressId = location.state?.addressId || "default";
      const customOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let orderPincode = "";
      let orderFullAddress = location.state?.addressFull || "Default Address";
      let destLat = location.state?.lat || null;
      let destLng = location.state?.lng || null;
      
      if (addressId !== "default") {
        const addrDoc = await getDoc(doc(db, "address", addressId));
        if (addrDoc.exists()) {
          orderPincode = addrDoc.data().pincode || "";
          orderFullAddress = addrDoc.data().full + ", " + addrDoc.data().landmark;
          destLat = addrDoc.data().lat || destLat;
          destLng = addrDoc.data().lng || destLng;
        }
      }

      // 0. Preliminary Stock Validation for Instamart
      const orderType = items[0]?.cartType || "food";

      if (orderType === 'instamart') {
        for (const item of items) {
          const inventoryId = item.itemId || item.id;
          const invDoc = await getDoc(doc(db, "instamart_inventory", inventoryId));
          if (invDoc.exists()) {
            const availableStock = Number(invDoc.data().stock || 0);
            if (item.quantity > availableStock) {
              toast.error(`Only ${availableStock} units available for ${item.name}. Please update cart.`);
              setProcessing(false);
              return;
            }
          } else {
            toast.error(`${item.name} is no longer available.`);
            setProcessing(false);
            return;
          }
        }
      }

      // 1. Create main order document
      
      const orderData = {
        orderId: customOrderId,
        userId: user.uid,
        userName: userProfile?.displayName || "User",
        customerEmail: user.email,
        contact: userProfile?.contact || "Not provided",
        restaurantId: items[0]?.restaurantId || "r1",
        restaurantName: items[0]?.restaurantName || "Cravit Kitchen",
        addressId: addressId,
        address: orderFullAddress,
        pincode: orderPincode,
        destLat,
        destLng,
        paymentMethod: selected.toUpperCase(),
        totalAmount: total,
        paymentStatus: selected === "cash" ? "pending" : "paid",
        orderStatus: orderType === 'instamart' ? 'ordered' : 'placed',
        orderType: orderType,
        storeId: orderType === 'instamart' ? (items[0]?.restaurantId || "") : "",
        kitchenStatus: orderType === 'instamart' ? 'received' : 'placed',
        deliveryStatus: "pending", 
        timeOfOrder: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      
      // 2. Map items to separate 'order_items' collection
      const itemPromises = items.map(item => {
        return addDoc(collection(db, "order_items"), {
          orderId: orderRef.id,
          customOrderId: customOrderId,
          itemId: item.itemId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          remarks: item.remarks || ""
        });
      });

      await Promise.all(itemPromises);
      
      // 3. (Stock depletion moved to backend/Dashboard when order is accepted)
      
      // 4. Clear cart in Firestore
      await clearCart();
      
      toast.success("Order Placed Successfully! 🍽️");
      navigate(`/order/${orderRef.id}`);
    } catch (error) {
      console.error("Order execution error", error);
      toast.error("Process failed. Please verify credentials.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <main className="container max-w-lg pb-20 px-4 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 pt-10 pb-6">
          <Link to="/checkout" className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:border-primary/20 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display font-black text-2xl text-white tracking-tight uppercase italic">Secure Payment</h1>
        </div>

        {/* Amount */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-hero border border-white/10 mb-8 text-center shadow-xl shadow-primary/20">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Final Authorization Total</p>
          <p className="text-4xl font-display font-black text-white">₹{total}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2">Selection Logic</p>
          {paymentMethods.map((pm) => (
            <button key={pm.id} onClick={() => setSelected(pm.id)}
              className={`w-full p-5 rounded-[2rem] border transition-all text-left group ${selected === pm.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${selected === pm.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
                   <pm.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className={`font-display font-bold text-sm ${selected === pm.id ? 'text-white' : 'text-slate-400'}`}>{pm.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{pm.desc}</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === pm.id ? 'border-primary' : 'border-slate-700'}`}>
                   {selected === pm.id && <div className="h-3 w-3 rounded-full bg-primary animate-in zoom-in" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Razorpay Information Panels */}
        {selected !== "cash" && (
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-in zoom-in duration-500 text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
            <Smartphone className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display font-black text-white italic uppercase tracking-tighter text-lg mb-2">Digital Escrow</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
              Upon execution, a secure Razorpay modal will initialize for your <span className="text-primary">{selected.toUpperCase()}</span> authorization.
            </p>
          </div>
        )}


        {selected === "cash" && (
          <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 mb-8 animate-in slide-in-from-top-4 duration-500">
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Pay <span className="text-white font-black">₹{total}</span> in currency when our executive reaches your coordinate. Please keep exact change ready.</p>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-3 mb-8 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Validated by AES-256 TLS Tunnel</span>
        </div>

        <button onClick={handlePay} disabled={processing}
          className="w-full h-14 rounded-3xl bg-gradient-hero text-white font-display font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="h-5 w-5 animate-spin" /> Authorizing...</> : (
            <>
               <span>Execute Transaction</span>
               <Check className="h-4 w-4" />
            </>
          )}
        </button>
      </main>
    </div>
  );
};

export default PaymentPage;
