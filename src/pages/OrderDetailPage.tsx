import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Star, Download, RotateCcw, XCircle, Navigation, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { mockOrders, updateLocalOrder } from "@/data/mockOrders";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

const statusSteps = ["placed", "accepted", "preparing", "picked", "delivered"];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState(mockOrders.find((o) => o.id === id));
  const { addItem } = useCart();
  const [rating, setRating] = useState(order?.rating || 0);
  const [deliveryRating, setDeliveryRating] = useState(order?.deliveryRating || 0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setOrder(mockOrders.find((o) => o.id === id));
  }, [id]);

  if (!order) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="container max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary font-medium mt-2 inline-block">Back to orders</Link>
      </div>
    </div>
  );

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order? Refund will be initiated to your original payment method.");
    if (!confirmCancel) return;

    const updates = {
      orderStatus: "cancelled" as any,
      refundStatus: "requested" as any,
      timeline: [
        ...order.timeline,
        { status: "cancelled", time: new Date().toLocaleTimeString(), description: "Order cancelled by customer" }
      ]
    };

    updateLocalOrder(order.id, updates);
    setOrder({ ...order, ...updates });
    toast.success("Order cancelled and refund initiated.");
  };

  const handleDownloadInvoice = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const invoiceContent = `
        INVOICE - CRAVIT SWIGGY CLONE
        Order ID: ${order.id}
        Date: ${new Date(order.createdAt).toLocaleDateString()}
        Restaurant: ${order.restaurantName}
        
        Items:
        ${order.items.map(i => `- ${i.name} x ${i.qty}: ₹${i.price * i.qty}`).join('\n')}
        
        --------------------------------
        Subtotal: ₹${order.subtotal}
        Tax: ₹${order.tax}
        Delivery Fee: ₹${order.deliveryFee}
        Discount: -₹${order.discount}
        TOTAL PAID: ₹${order.total}
        
        Delivery Address:
        ${order.deliveryAddress}
        
        Thank you for ordering!
      `;

      const blob = new Blob([invoiceContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${order.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      toast.success("Invoice downloaded successfully!");
    }, 1500);
  };

  const currentStep = order.orderStatus === "cancelled" ? -1 : statusSteps.indexOf(order.orderStatus);
  const isActive = currentStep >= 0 && currentStep < 4;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to="/orders" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">{order.restaurantName}</h1>
            <p className="text-xs text-muted-foreground">{order.id}</p>
          </div>
          {isActive && (
            <Link to={`/track/${order.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">
              <Navigation className="h-3.5 w-3.5" /> Track
            </Link>
          )}
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-4">Order Timeline</h3>
          {order.orderStatus === "cancelled" ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-sm text-destructive">Order Cancelled</p>
                {order.refundStatus === "requested" && <p className="text-xs text-warning mt-0.5">Refund Requested</p>}
                {order.refundStatus === "processed" && <p className="text-xs text-accent mt-0.5">✓ Refund processed</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {statusSteps.map((step, i) => {
                const t = order.timeline.find((t) => t.status === step);
                const active = i <= currentStep;
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-2 ${active ? "bg-accent border-accent" : "border-muted-foreground"}`} />
                      {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${i < currentStep ? "bg-accent" : "bg-muted"}`} />}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium capitalize ${active ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                      {t && <p className="text-xs text-muted-foreground">{t.time} — {t.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">Items</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 text-foreground">
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-foreground"><span>Delivery</span><span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span></div>
            <div className="flex justify-between text-foreground"><span>Tax</span><span>₹{order.tax}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-accent"><span>Discount</span><span>-₹{order.discount}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-foreground"><span>Total</span><span>₹{order.total}</span></div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center gap-2 text-sm text-foreground"><MapPin className="h-4 w-4 text-primary" />{order.deliveryAddress}</div>
          {order.deliveryPartnerName && (
            <div className="flex items-center gap-2 text-sm text-foreground mt-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Delivery by {order.deliveryPartnerName}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">Paid via {order.paymentMethod} · {order.paymentStatus}</p>
        </div>

        {/* Rating */}
        {order.orderStatus === "delivered" && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Rate your experience</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Restaurant</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => { setRating(s); toast.success("Rating saved!"); }}>
                      <Star className={`h-6 w-6 ${s <= rating ? "fill-warning text-warning" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              {order.deliveryPartnerName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => { setDeliveryRating(s); toast.success("Rating saved!"); }}>
                        <Star className={`h-6 w-6 ${s <= deliveryRating ? "fill-warning text-warning" : "text-muted"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {order.review && <p className="text-xs text-muted-foreground italic">"{order.review}"</p>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            disabled={isDownloading}
            onClick={handleDownloadInvoice}
            className="flex-1 h-10 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Invoice
          </button>
          {order.orderStatus === "delivered" && (
            <>
              <button onClick={() => {
                order.items.forEach(item => {
                  const menuItem = {
                    id: item.name.toLowerCase().replace(/\s+/g, '-'),
                    name: item.name,
                    price: item.price,
                    description: "Previously ordered item",
                    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                    category: "Reordered",
                    isVeg: true
                  };
                  // @ts-ignore
                  addItem(menuItem, order.restaurantId, order.restaurantName);
                });
                toast.success("Items added to cart!");
              }} className="flex-1 h-10 rounded-xl bg-gradient-hero text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> Reorder
              </button>
              <Link to={`/feedback/${order.id}`} className="flex-1 h-10 rounded-xl bg-warning/10 text-warning font-medium text-sm flex items-center justify-center gap-2">
                <Star className="h-4 w-4" /> Feedback
              </Link>
            </>
          )}
          {(order.orderStatus === "placed" || order.orderStatus === "accepted") && (
            <button onClick={handleCancel} className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <XCircle className="h-4 w-4" /> Cancel Order
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
