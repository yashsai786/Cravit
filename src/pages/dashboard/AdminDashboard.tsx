import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Store, ShoppingBag, TrendingUp, Shield, ShieldOff, Eye, MessageSquare, Check, X, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockOrders, mockAllUsers, mockComplaints, mockPendingRestaurants } from "@/data/mockOrders";
import { restaurants } from "@/data/mockData";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", path: "/dashboard/admin", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Users", path: "/dashboard/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Restaurants", path: "/dashboard/admin/restaurants", icon: <Store className="h-4 w-4" /> },
  { label: "Orders", path: "/dashboard/admin/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Approvals", path: "/dashboard/admin/approvals", icon: <Check className="h-4 w-4" /> },
  { label: "Complaints", path: "/dashboard/admin/complaints", icon: <MessageSquare className="h-4 w-4" /> },
];

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [localUsers, setLocalUsers] = useState<any[]>(mockAllUsers);
  const [localApprovals, setLocalApprovals] = useState<any[]>(mockPendingRestaurants);
  const [localComplaints, setLocalComplaints] = useState<any[]>(mockComplaints);

  // Derive tab from URL
  const tab = pathname.endsWith("/users") ? "users" :
    pathname.endsWith("/restaurants") ? "restaurants" :
      pathname.endsWith("/orders") ? "orders" :
        pathname.endsWith("/approvals") ? "approvals" :
          pathname.endsWith("/complaints") ? "complaints" : "overview";

  const handleTabChange = (t: string) => {
    if (t === "overview") navigate("/dashboard/admin");
    else navigate(`/dashboard/admin/${t}`);
  };

  const totalRevenue = mockOrders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  const toggleUserStatus = (id: string) => {
    setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
    toast.success("User status updated");
  };

  const handleApproval = (id: string, status: 'approved' | 'rejected') => {
    setLocalApprovals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Restaurant registration ${status}`);
  };

  const updateComplaint = (id: string, status: any) => {
    setLocalComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Complaint marked as ${status.replace('_', ' ')}`);
  };

  const complaintStatusColors: Record<string, string> = {
    open: "bg-destructive/10 text-destructive",
    in_progress: "bg-warning/10 text-warning",
    resolved: "bg-accent/10 text-accent",
  };

  return (
    <DashboardLayout title="Admin" items={navItems}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users", value: localUsers.length, color: "text-info" },
          { label: "Restaurants", value: restaurants.length, color: "text-primary" },
          { label: "Total Orders", value: mockOrders.length, color: "text-warning" },
          { label: "Revenue", value: `₹${totalRevenue}`, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["overview", "users", "restaurants", "orders", "approvals", "complaints"] as const).map((t) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? "bg-foreground text-card" : "bg-secondary text-secondary-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card shadow-card">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Platform Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between text-foreground"><span>Active customers</span><span>{localUsers.filter((u) => u.role === "customer" && u.status === "active").length}</span></div>
              <div className="flex justify-between text-foreground"><span>Active partners</span><span>{localUsers.filter((u) => u.role === "delivery" && u.status === "active").length}</span></div>
              <div className="flex justify-between text-foreground"><span>Completed orders</span><span>{mockOrders.filter((o) => o.orderStatus === "delivered").length}</span></div>
              <div className="flex justify-between text-foreground"><span>Cancelled orders</span><span>{mockOrders.filter((o) => o.orderStatus === "cancelled").length}</span></div>
              <div className="flex justify-between text-foreground"><span>Open complaints</span><span>{localComplaints.filter((c) => c.status === "open").length}</span></div>
              <div className="flex justify-between text-foreground"><span>Pending approvals</span><span>{localApprovals.filter((r) => r.status === "pending").length}</span></div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card shadow-card">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Recent Orders</h3>
            {mockOrders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 text-sm border-b border-border last:border-0">
                <div>
                  <p className="text-foreground font-medium">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.restaurantName}</p>
                </div>
                <span className="text-sm font-bold text-foreground">₹{o.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-2">
          {localUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · <span className="capitalize">{u.role}</span></p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
              <button onClick={() => toggleUserStatus(u.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground">
                {u.status === "active" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "restaurants" && (
        <div className="space-y-2">
          {restaurants.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
              <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.cuisine.join(", ")} · ⭐ {r.rating}</p>
              </div>
              <button onClick={() => navigate(`/restaurant/${r.id}`)} className="p-1.5 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-2">
          {mockOrders.map((o) => (
            <div key={o.id}
              onClick={() => navigate(`/order/${o.id}`)}
              className="flex items-center justify-between p-3 rounded-xl bg-card shadow-card hover:bg-secondary/50 cursor-pointer transition-colors group">
              <div>
                <p className="font-medium text-sm text-foreground">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.restaurantName} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">₹{o.total}</p>
                <span className={`text-[10px] font-bold capitalize ${o.orderStatus === "delivered" ? "text-accent" : o.orderStatus === "cancelled" ? "text-destructive" : "text-warning"}`}>
                  {o.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "approvals" && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-foreground">Restaurant Registration Requests</h3>
          {localApprovals.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-card shadow-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-bold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Owner: {r.owner} · {r.cuisine}</p>
                  <p className="text-xs text-muted-foreground">{r.email} · {r.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Applied: {r.appliedAt}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${r.status === "pending" ? "bg-warning/10 text-warning" : r.status === "approved" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                  }`}>{r.status}</span>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleApproval(r.id, "approved")}
                    className="flex-1 h-9 rounded-xl bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => handleApproval(r.id, "rejected")}
                    className="flex-1 h-9 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-1.5">
                    <X className="h-3 w-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "complaints" && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-foreground">Customer Complaints</h3>
          {localComplaints.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-card shadow-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.id} · {c.userName} · Order {c.orderId}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${complaintStatusColors[c.status] || ""}`}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                {c.status === "open" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateComplaint(c.id, "in_progress")}
                      className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium hover:bg-warning hover:text-warning-foreground transition-colors">
                      Investigate
                    </button>
                    <button onClick={() => updateComplaint(c.id, "resolved")}
                      className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                      Resolve
                    </button>
                  </div>
                )}
                {c.status === "in_progress" && (
                  <button onClick={() => updateComplaint(c.id, "resolved")}
                    className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
