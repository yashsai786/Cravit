import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, MapPin, TrendingUp, Clock, Check, Phone, Navigation } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockOrders, updateLocalOrder } from "@/data/mockOrders";
import { toast } from "sonner";

const navItems = [
  { label: "Active", path: "/dashboard/delivery", icon: <Package className="h-4 w-4" /> },
  { label: "History", path: "/dashboard/delivery/history", icon: <Clock className="h-4 w-4" /> },
  { label: "Earnings", path: "/dashboard/delivery/earnings", icon: <TrendingUp className="h-4 w-4" /> },
];

const DeliveryDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentPartnerId = "u3";
  const [assignedOrders, setAssignedOrders] = useState(mockOrders.filter((o) => o.deliveryPartnerId === currentPartnerId));

  // Sync state when navigation happens
  useEffect(() => {
    setAssignedOrders(mockOrders.filter((o) => o.deliveryPartnerId === currentPartnerId));
  }, [pathname]);

  const active = assignedOrders.filter((o) => ["accepted", "preparing", "picked"].includes(o.orderStatus));
  const delivered = assignedOrders.filter((o) => o.orderStatus === "delivered");

  const tab = pathname.endsWith("/history") ? "history" : pathname.endsWith("/earnings") ? "earnings" : "active";

  const totalEarnings = delivered.length * 45;

  const updateStatus = (id: string, currentStatus: string) => {
    let nextStatus: any = "delivered";
    if (currentStatus === "accepted" || currentStatus === "preparing") nextStatus = "picked";
    else if (currentStatus === "picked") nextStatus = "delivered";

    const existingOrder = mockOrders.find(o => o.id === id);
    const updates = {
      orderStatus: nextStatus,
      timeline: [
        ...(existingOrder?.timeline || []),
        { status: nextStatus, time: new Date().toLocaleTimeString(), description: `Package ${nextStatus} by delivery partner` }
      ]
    };

    updateLocalOrder(id, updates);
    setAssignedOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    toast.success(`Order marked as ${nextStatus}!`);
  };

  return (
    <DashboardLayout title="Delivery" items={navItems}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active Orders", value: active.length, color: "text-warning" },
          { label: "Delivered Today", value: delivered.length, color: "text-accent" },
          { label: "Earnings", value: `₹${totalEarnings}`, color: "text-primary" },
          { label: "Avg Rating", value: "4.5", color: "text-info" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(["active", "history", "earnings"] as const).map((t) => (
          <button key={t} onClick={() => navigate(t === "active" ? "/dashboard/delivery" : `/dashboard/delivery/${t}`)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? "bg-foreground text-card" : "bg-secondary text-secondary-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {active.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-secondary/20 border-2 border-dashed border-border">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-sm text-muted-foreground">No active deliveries assigned to you.</p>
              <p className="text-xs text-muted-foreground mt-1">Orders placed will appear here automatically.</p>
            </div>
          )}
          {active.map((order) => (
            <div key={order.id} className="p-4 rounded-xl bg-card shadow-card border-l-4 border-accent">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-bold text-foreground">{order.restaurantName}</p>
                  <p className="text-xs text-muted-foreground">{order.id} · ₹{order.total}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${order.orderStatus === 'picked' ? 'bg-primary/20 text-primary' : 'bg-warning/10 text-warning'}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3 text-primary" />{order.deliveryAddress}
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(order.id, order.orderStatus)}
                  className="flex-1 h-9 rounded-xl bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90">
                  <Check className="h-3 w-3" />
                  {order.orderStatus === "picked" ? "Mark Delivered" : "Mark Picked Up"}
                </button>
                <button onClick={() => toast.info("Opening navigation...")} className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Navigation className="h-4 w-4" />
                </button>
                <button onClick={() => toast.info("Calling customer...")} className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {delivered.map((order) => (
            <div key={order.id} className="p-4 rounded-xl bg-card shadow-card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{order.restaurantName}</p>
                <p className="text-xs text-muted-foreground">{order.id} · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-accent">₹45</p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
            </div>
          ))}
          {delivered.length === 0 && <p className="text-center py-8 text-muted-foreground">No earnings history</p>}
        </div>
      )}
      {/* earnings tab content remains same */}
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
