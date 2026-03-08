import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Navigation, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { mockOrders } from "@/data/mockOrders";

const statusSteps = ["placed", "accepted", "preparing", "picked", "delivered"];

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const order = mockOrders.find((o) => o.id === id);

  if (!order) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="container max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary font-medium mt-2 inline-block">Back to orders</Link>
      </div>
    </div>
  );

  const currentStep = order.orderStatus === "cancelled" ? -1 : statusSteps.indexOf(order.orderStatus);
  const isActive = currentStep >= 0 && currentStep < 4;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to={`/order/${id}`} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Track Order</h1>
            <p className="text-xs text-muted-foreground">{order.id}</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="rounded-2xl overflow-hidden mb-4 relative bg-secondary" style={{ height: 280 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Navigation className="h-8 w-8 text-primary" />
            </div>
            <p className="font-display font-bold text-foreground">Live GPS Tracking</p>
            <p className="text-xs text-muted-foreground mt-1">Real-time delivery partner location will appear here</p>
            {isActive && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium text-accent">Live tracking active</span>
              </div>
            )}
          </div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        {/* Status progress bar */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center justify-between mb-4">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= currentStep ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {i <= currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`h-1 flex-1 mx-1 rounded ${i < currentStep ? "bg-accent" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {statusSteps.map((step, i) => (
              <p key={step} className={`text-[10px] capitalize ${i <= currentStep ? "text-accent font-medium" : "text-muted-foreground"}`}>{step}</p>
            ))}
          </div>
        </div>

        {/* ETA & delivery info */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display font-bold text-sm text-foreground">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">25-30 minutes</p>
            </div>
          </div>
          {order.deliveryPartnerName && (
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {order.deliveryPartnerName[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{order.deliveryPartnerName}</p>
                <p className="text-xs text-muted-foreground">Delivery Partner</p>
              </div>
              <button className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Delivery address */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-medium">Delivering to</p>
              <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Order items summary */}
        <div className="p-4 rounded-xl bg-card shadow-card">
          <h3 className="font-display font-bold text-sm text-foreground mb-2">{order.restaurantName}</h3>
          {order.items.map((item, i) => (
            <p key={i} className="text-xs text-muted-foreground">{item.name} × {item.qty}</p>
          ))}
          <p className="text-sm font-bold text-foreground mt-2">Total: ₹{order.total}</p>
        </div>
      </main>
    </div>
  );
};

export default OrderTrackingPage;
