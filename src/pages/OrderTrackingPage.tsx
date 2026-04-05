import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Navigation, CheckCircle2, Loader2, XCircle, ShoppingBag } from "lucide-react";
import Header from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";

const statusSteps = ["placed", "accepted", "preparing", "picked", "delivered"];

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapObj, setMapObj] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    const fetchItems = async () => {
      const q = query(collection(db, "order_items"), where("orderId", "==", id));
      const qSnap = await getDocs(q);
      setOrderItems(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchItems();

    return () => unsub();
  }, [id]);

  // Map Initialization
  useEffect(() => {
    if (order && order.destLat && !mapObj) {
      const initMap = async () => {
        try {
          const { loadMapplsSDK } = await import("@/lib/mappls");
          const token = await loadMapplsSDK();
          
          if (typeof (window as any).mappls === 'undefined') {
            setTimeout(initMap, 500);
            return;
          }

          const mapContainer = document.getElementById("customer-tracker-map");
          if (!mapContainer) return;

          const map = new (window as any).mappls.Map("customer-tracker-map", {
            center: [order.destLat, order.destLng],
            zoom: 15,
            token: token
          });

          setMapObj(map);
        } catch (err) {
          console.error("CUSTOMER_MAP_SYNC_FAILURE", err);
        }
      };
      initMap();
    }
  }, [order, mapObj]);

  // Real-time Coordinate Render
  useEffect(() => {
    if (mapObj && order && order.deliveryPartnerLat) {
      if (typeof (window as any).mappls.direction !== 'function') {
        console.warn("CUSTOMER_HUD_DIRECTION_ENGINE_PENDING");
        return;
      }
      const p1 = `${order.deliveryPartnerLat},${order.deliveryPartnerLng}`;
      const p2 = `${order.destLat},${order.destLng}`;
      
      (window as any).mappls.direction({
        map: mapObj,
        start: p1,
        end: p2,
        callback: (res: any) => {
           console.log("Vector trace updated", res);
        }
      });
    }
  }, [mapObj, order?.deliveryPartnerLat]);

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <div className="flex flex-col items-center justify-center py-40">
         <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
         <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Coordinate Uplink...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <div className="container max-w-2xl py-20 text-center">
        <XCircle className="h-16 w-16 text-slate-800 mx-auto mb-6" />
        <p className="text-xl font-display font-black text-white uppercase italic tracking-tight">Signal Interrupted</p>
        <Link to="/orders" className="text-primary font-bold mt-6 inline-block px-8 py-3 rounded-2xl bg-primary/10 border border-primary/20">Back to Base</Link>
      </div>
    </div>
  );

  const currentStep = order.orderStatus === "cancelled" ? -1 : statusSteps.indexOf(order.orderStatus);
  const isActive = currentStep >= 0 && currentStep < 4;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-2xl mx-auto pb-20 px-6">
        <div className="flex items-center gap-6 pt-10 pb-10">
          <Link to={`/order/${id}`} className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-primary/40 transition-all group">
            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-white" />
          </Link>
          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-tight uppercase italic">{order.restaurantName || "Kitchen Tracker"}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 tracking-[0.2em]">{order.orderId}</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div id="customer-tracker-map" className="rounded-[3rem] overflow-hidden mb-10 relative bg-slate-900/50 border border-slate-800 shadow-2xl h-[420px] z-10 transition-all duration-1000">
          {!order.deliveryPartnerLat && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-slate-950/40 backdrop-blur-sm">
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 animate-pulse">
                <Navigation className="h-10 w-10 text-primary" />
              </div>
              <p className="font-display font-black text-2xl text-white uppercase italic tracking-tight">Awaiting Vector Seal</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Real-time coordinates available upon partner dispatch</p>
            </div>
          )}
          {/* Grid fallback */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        {/* Status progress bar */}
        <div className="p-10 rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
              <Clock className="h-32 w-32" />
           </div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                  i <= currentStep ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-slate-800 text-slate-600 border border-white/5"
                }`}>
                  {i <= currentStep ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`h-1.5 flex-1 mx-2 rounded-full transition-all duration-700 ${i < currentStep ? "bg-primary" : "bg-slate-800"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 text-center relative z-10">
            {statusSteps.map((step, i) => (
              <p key={step} className={`text-[9px] font-black uppercase tracking-widest ${i <= currentStep ? "text-primary italic" : "text-slate-600"}`}>{step}</p>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Deployment Target */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <MapPin className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Delivery Coordinate</p>
                    <p className="text-xs text-slate-200 font-bold truncate max-w-[200px]">{order.address || "Zone Alpha"}</p>
                 </div>
              </div>
           </div>

           {/* Fiscal Summation */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShoppingBag className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Settlement Value</p>
                    <p className="text-sm font-black text-white italic tracking-tight">₹{order.totalAmount}</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default OrderTrackingPage;
