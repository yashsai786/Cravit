import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, UtensilsCrossed, Star, TrendingUp, Plus, Edit, Trash2, Check, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { restaurants } from "@/data/mockData";
import { mockOrders, updateLocalOrder } from "@/data/mockOrders";
import { toast } from "sonner";

const navItems = [
  { label: "Orders", path: "/dashboard/restaurant", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Menu", path: "/dashboard/restaurant/menu", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { label: "Reviews", path: "/dashboard/restaurant/reviews", icon: <Star className="h-4 w-4" /> },
  { label: "Analytics", path: "/dashboard/restaurant/analytics", icon: <TrendingUp className="h-4 w-4" /> },
];

const RestaurantDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const restaurant = restaurants[0]; // Mock: owner sees Meghana Foods (r1)

  const [localOrders, setLocalOrders] = useState(mockOrders.filter((o) => o.restaurantId === restaurant.id));
  const [localMenu, setLocalMenu] = useState(restaurant.menu);

  // Sync state whenever mockOrders or pathname changes
  useEffect(() => {
    setLocalOrders(mockOrders.filter((o) => o.restaurantId === restaurant.id));
  }, [pathname]);

  const tab = pathname.endsWith("/menu") ? "menu" : pathname.endsWith("/reviews") ? "reviews" : pathname.endsWith("/analytics") ? "analytics" : "orders";

  const revenue = localOrders.filter((o) => o.paymentStatus === "paid" && o.orderStatus === "delivered").reduce((s, o) => s + o.total, 0);

  const updateOrderStatus = (id: string, status: any) => {
    const existingOrder = mockOrders.find(o => o.id === id);
    const updates = {
      orderStatus: status,
      timeline: [
        ...(existingOrder?.timeline || []),
        { status, time: new Date().toLocaleTimeString(), description: `Order ${status} by restaurant` }
      ]
    };

    updateLocalOrder(id, updates);
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    toast.success(`Order ${status === 'accepted' ? 'accepted' : 'updated'}!`);
  };

  const deleteMenuItem = (id: string) => {
    setLocalMenu(prev => prev.filter(m => m.id !== id));
    toast.success("Item removed from menu");
  };

  const activeOrders = localOrders.filter(o => !["delivered", "cancelled"].includes(o.orderStatus));
  const pastOrders = localOrders.filter(o => ["delivered", "cancelled"].includes(o.orderStatus));

  return (
    <DashboardLayout title="Restaurant" items={navItems}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's Revenue", value: `₹${revenue}`, color: "text-accent" },
          { label: "Active Orders", value: activeOrders.length, color: "text-warning" },
          { label: "Total Orders", value: localOrders.length, color: "text-info" },
          { label: "Rating", value: restaurant.rating, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(["orders", "menu", "analytics", "reviews"] as const).map((t) => (
          <button key={t} onClick={() => navigate(t === "orders" ? "/dashboard/restaurant" : `/dashboard/restaurant/${t}`)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${tab === t ? "bg-foreground text-card" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" /> Active Orders
            </h3>
            <div className="space-y-3">
              {activeOrders.length === 0 && <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-xl text-center">No active orders found for Meghana Foods. <br /> (Tip: Place an order from Meghana Foods to see it here!)</p>}
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl bg-card shadow-card border-l-4 border-warning">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-foreground">{order.id}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground uppercase">{order.paymentMethod}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{order.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
                      <p className="text-sm font-bold text-foreground mt-1">₹{order.total}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize bg-info/10 text-info`}>{order.orderStatus}</span>
                      <div className="flex gap-1.5 mt-1">
                        {(order.orderStatus === "placed") && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, "accepted")} className="h-9 px-3 rounded-lg bg-accent text-accent-foreground text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity">
                              <Check className="h-4 w-4" /> Accept
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {order.orderStatus === "accepted" && (
                          <button onClick={() => updateOrderStatus(order.id, "preparing")} className="h-9 px-4 rounded-lg bg-warning text-warning-foreground text-xs font-bold hover:opacity-90">
                            Start Preparing
                          </button>
                        )}
                        {order.orderStatus === "preparing" && (
                          <span className="text-xs text-muted-foreground animate-pulse">Waiting for pickup...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-foreground mb-3 opacity-60">Past Orders</h3>
            <div className="space-y-2 opacity-80">
              {pastOrders.map((order) => (
                <div key={order.id} className="p-3 rounded-xl bg-secondary/20 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{order.id}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{order.total}</p>
                    <span className={`text-[10px] font-bold capitalize ${order.orderStatus === "delivered" ? "text-accent" : "text-muted-foreground"}`}>{order.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div className="space-y-3">
          <button onClick={() => toast.info("Opening Add Item portal...")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Item
          </button>
          {localMenu.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground">₹{item.price} · {item.category}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toast.info(`Editing ${item.name}...`)} className="p-1.5 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></button>
                <button onClick={() => deleteMenuItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ... analytics and reviews tabs remain same ... */}
    </DashboardLayout>
  );
};

export default RestaurantDashboard;
