import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, TrendingUp, AlertTriangle, ClipboardList, Check, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { instamartItems } from "@/data/mockData";
import { mockOrders, updateLocalOrder } from "@/data/mockOrders";
import { toast } from "sonner";

const navItems = [
  { label: "Inventory", path: "/dashboard/instamart", icon: <Package className="h-4 w-4" /> },
  { label: "Orders", path: "/dashboard/instamart/orders", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Analytics", path: "/dashboard/instamart/analytics", icon: <TrendingUp className="h-4 w-4" /> },
];

const InstamartDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState(instamartItems.map((i) => ({ ...i, stock: i.inStock ? Math.floor(Math.random() * 50) + 10 : 0 })));

  // Use global mockOrders filtered for instamart
  const [localOrders, setLocalOrders] = useState(mockOrders.filter(o => o.restaurantId === "instamart"));

  // Sync if mockOrders changes (e.g. on mount or navigation)
  useEffect(() => {
    setLocalOrders(mockOrders.filter(o => o.restaurantId === "instamart"));
  }, [pathname]);

  // Derive tab from URL
  const tab = pathname.endsWith("/orders") ? "orders" : pathname.endsWith("/analytics") ? "analytics" : "inventory";

  const outOfStock = items.filter((i) => i.stock === 0);

  const handleTabChange = (t: string) => {
    if (t === "inventory") navigate("/dashboard/instamart");
    else navigate(`/dashboard/instamart/${t}`);
  }

  const updateOrderStatus = (id: string, status: string) => {
    const existingOrder = mockOrders.find(o => o.id === id);
    const updates = {
      orderStatus: status as any,
      timeline: [
        ...(existingOrder?.timeline || []),
        { status, time: new Date().toLocaleTimeString(), description: `Instamart order ${status}` }
      ]
    };
    updateLocalOrder(id, updates);
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    toast.success(`Order marked as ${status}`);
  };

  const revenue = localOrders.filter(o => o.orderStatus === "delivered").reduce((s, o) => s + o.total, 0);

  return (
    <DashboardLayout title="Instamart" items={navItems}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Products", value: items.length, color: "text-info" },
          { label: "In Stock", value: items.filter((i) => i.stock > 0).length, color: "text-accent" },
          { label: "Out of Stock", value: outOfStock.length, color: "text-destructive" },
          { label: "Revenue", value: `₹${revenue || "12,450"}`, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(["inventory", "orders", "analytics"] as const).map((t) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? "bg-foreground text-card" : "bg-secondary text-secondary-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "inventory" && (
        <div className="space-y-2">
          {outOfStock.length > 0 && (
            <div className="p-3 rounded-xl bg-destructive/10 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">{outOfStock.length} items out of stock</span>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.category} · ₹{item.price}/{item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${item.stock > 0 ? "text-accent" : "text-destructive"}`}>
                  {item.stock > 0 ? `${item.stock} units` : "Out"}
                </span>
                <button onClick={() => { setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stock: i.stock + 20 } : i)); toast.success("Stock updated"); }}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {localOrders.length === 0 && <p className="text-center py-8 text-muted-foreground">No orders yet</p>}
          {localOrders.map((order) => (
            <div key={order.id} className="p-4 rounded-xl bg-card shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.items.map((i: any) => `${i.name} x ${i.qty}`).join(", ")}</p>
                  <p className="text-sm font-bold text-foreground mt-1">₹{order.total}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${order.orderStatus === "delivered" ? "bg-accent/10 text-accent" : order.orderStatus === "ready" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                    }`}>{order.orderStatus}</span>
                  {order.orderStatus === "placed" && (
                    <button onClick={() => updateOrderStatus(order.id, "preparing")} className="h-7 px-2 rounded-lg bg-accent/10 text-accent text-[10px] font-bold uppercase transition-colors hover:bg-accent hover:text-white">
                      Accept
                    </button>
                  )}
                  {order.orderStatus === "preparing" && (
                    <button onClick={() => updateOrderStatus(order.id, "delivered")} className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card shadow-card">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Revenue</h3>
            <div className="grid grid-cols-3 gap-4">
              {[{ label: "Today", value: `₹${revenue}` }, { label: "Week", value: `₹${revenue * 5}` }, { label: "Month", value: `₹${revenue * 22}` }].map((r) => (
                <div key={r.label} className="text-center">
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                  <p className="text-lg font-bold text-foreground">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card shadow-card">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Top Categories</h3>
            {["Fruits & Vegetables", "Dairy & Bread", "Snacks", "Beverages"].map((cat, i) => (
              <div key={cat} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${90 - i * 15}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{90 - i * 15}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstamartDashboard;
