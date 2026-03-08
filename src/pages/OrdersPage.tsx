import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, RotateCcw, Star, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import { mockOrders } from "@/data/mockOrders";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  placed: "bg-info/10 text-info",
  accepted: "bg-info/10 text-info",
  preparing: "bg-warning/10 text-warning",
  picked: "bg-primary/10 text-primary",
  delivered: "bg-accent/10 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
};

const OrdersPage = () => {
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = mockOrders;
    if (statusFilter !== "all") list = list.filter((o) => o.orderStatus === statusFilter);
    if (search) list = list.filter((o) => o.restaurantName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="container max-w-2xl pb-20 px-4">
        <h1 className="font-display font-bold text-xl text-foreground pt-6 pb-4">My Orders</h1>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search orders..." />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-secondary text-sm text-foreground border-none focus:outline-none">
            <option value="all">All</option>
            <option value="delivered">Delivered</option>
            <option value="preparing">In Progress</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link key={order.id} to={`/order/${order.id}`}
              className="block p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{order.restaurantName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.id} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{order.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="font-bold text-sm text-foreground">₹{order.total}</span>
                <div className="flex items-center gap-3">
                  {order.rating && (
                    <span className="flex items-center gap-1 text-xs text-warning"><Star className="h-3 w-3 fill-current" />{order.rating}</span>
                  )}
                  {order.orderStatus === "delivered" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
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
                          // @ts-ignore - simulating adding items back to cart
                          addItem(menuItem, order.restaurantId, order.restaurantName);
                        });
                        toast.success("Order items added to cart!");
                      }}
                      className="flex items-center gap-1 text-xs text-primary font-medium"
                    >
                      <RotateCcw className="h-3 w-3" /> Reorder
                    </button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-medium">No orders found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
