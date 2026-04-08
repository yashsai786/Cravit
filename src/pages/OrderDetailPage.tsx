import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Star, Download, RotateCcw, XCircle, Navigation, Loader2, ReceiptText, ShoppingBag, Clock, CreditCard, Mail, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";

const foodSteps = ["placed", "accepted", "preparing", "picked", "on-way", "delivered"];
const instamartSteps = ["ordered", "packed", "picked", "on-way", "delivered"];

// Status normalization map to handle various internal status strings
const statusAlias: Record<string, string> = {
  "handed_over": "preparing", // Kitchen is done, waiting for pickup
  "assigned": "preparing",    // Partner assigned, not yet picked
  "on-way": "on-way",
  "out_for_delivery": "on-way",
  "ready": "preparing"
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

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

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <div className="flex flex-col items-center justify-center py-40">
         <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
         <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Matrix Records...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <div className="container max-w-2xl py-20 text-center">
        <XCircle className="h-16 w-16 text-slate-800 mx-auto mb-6" />
        <p className="text-xl font-display font-black text-white uppercase italic tracking-tight">Order Metadata Missing</p>
        <Link to="/orders" className="text-primary font-bold mt-6 inline-block px-8 py-3 rounded-2xl bg-primary/10 border border-primary/20">Back to Transaction Logs</Link>
      </div>
    </div>
  );

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Terminate this operation? System will initiate secondary credit protocols.");
    if (!confirmCancel) return;

    try {
      await updateDoc(doc(db, "orders", order.id), {
        orderStatus: "cancelled",
        updatedAt: Date.now()
      });
      toast.success("Transaction voided successfully.");
    } catch (e) {
      toast.error("Operation failed. Record locked.");
    }
  };

  const generateBill = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200]
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 10;

      const addDashedLine = () => {
        y += 2;
        doc.setLineDashPattern([1, 1], 0);
        doc.line(5, y, pageWidth - 5, y);
        y += 5;
        doc.setLineDashPattern([], 0);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(order.restaurantName || "MAHARAJA", pageWidth / 2, y, { align: "center" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Pure Veg", pageWidth / 2, y, { align: "center" });
      y += 4;
      doc.text(order.address || "Dadar(W), Mumbai", pageWidth / 2, y, { align: "center" });
      y += 2;

      addDashedLine();

      doc.text("TAX INVOICE", pageWidth / 2, y, { align: "center" });
      y += 2;

      addDashedLine();

      const dateStr = order.createdAt?.toDate 
        ? new Date(order.createdAt.toDate()).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      doc.text(`Date: ${dateStr}`, 5, y);
      doc.text(`Bill No. : ${order.orderId ? order.orderId.substring(order.orderId.length - 4) : '8598'}`, pageWidth - 5, y, { align: "right" });
      y += 5;
      
      doc.text(`PBoy: COUNTER`, 5, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("Particulars", 5, y);
      doc.text("Qty", pageWidth - 35, y, { align: "right" });
      doc.text("Rate", pageWidth - 20, y, { align: "right" });
      doc.text("Amount", pageWidth - 5, y, { align: "right" });
      y += 2;

      addDashedLine();

      doc.setFont("helvetica", "normal");
      let totalItems = 0;
      orderItems.forEach(item => {
        const name = item.name.substring(0, 15);
        doc.text(name, 5, y);
        doc.text(item.quantity.toString(), pageWidth - 35, y, { align: "right" });
        doc.text(item.price.toString(), pageWidth - 20, y, { align: "right" });
        doc.text((item.quantity * item.price).toString(), pageWidth - 5, y, { align: "right" });
        totalItems += item.quantity;
        y += 5;
      });

      y -= 3;
      addDashedLine();

      const subTotal = order.totalAmount || 0;
      const sgst = (subTotal * 0.025).toFixed(2);
      const cgst = (subTotal * 0.025).toFixed(2);
      
      doc.text("Sub Total :", pageWidth - 20, y, { align: "right" });
      doc.text(subTotal.toString() + ".00", pageWidth - 5, y, { align: "right" });
      y += 5;
      
      doc.text("SGST @2.5% :", pageWidth - 20, y, { align: "right" });
      doc.text(sgst, pageWidth - 5, y, { align: "right" });
      y += 5;

      doc.text("CGST @2.5% :", pageWidth - 20, y, { align: "right" });
      doc.text(cgst, pageWidth - 5, y, { align: "right" });
      y += 2;

      addDashedLine();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${totalItems} Item(s)`, 5, y);
      doc.text("Total :", pageWidth - 25, y, { align: "right" });
      doc.text(Math.round(subTotal + parseFloat(sgst) + parseFloat(cgst)).toString(), pageWidth - 5, y, { align: "right" });
      y += 2;
      
      addDashedLine();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const timeStr = order.createdAt?.toDate 
        ? new Date(order.createdAt.toDate()).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: false }) 
        : new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: false });
      
      doc.text("FSSAI NO - 11516004000575", 5, y);
      doc.text(`(${timeStr})`, pageWidth - 5, y, { align: "right" });
      y += 5;

      doc.text("E.&O.E.", 5, y);
      doc.text("Thank You", pageWidth / 2, y, { align: "center" });
      doc.text("Visit Again", pageWidth - 5, y, { align: "right" });

      doc.save(`Invoice_${order.orderId || 'bill'}.pdf`);
      toast.success("Bill downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate bill");
    } finally {
      setIsDownloading(false);
    }
  };

  const statusSteps = order.orderType === "instamart" ? instamartSteps : foodSteps;
  const normalizedStatus = statusAlias[order.orderStatus] || order.orderStatus;
  const currentStep = order.orderStatus === "cancelled" ? -1 : statusSteps.indexOf(normalizedStatus);
  const isCancellable = ["placed", "ordered"].includes(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-3xl mx-auto pb-20 px-6">
        <div className="flex items-center gap-6 pt-10 pb-10">
          <Link to="/orders" className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-primary/40 transition-all group">
            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-black text-3xl text-white tracking-tight uppercase italic">{order.restaurantName || "Cravit Kitchen"}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 tracking-[0.2em]">{order.orderId}</p>
          </div>
          {["placed", "accepted", "preparing", "picked"].includes(order.orderStatus) && (
            <Link to={`/track/${order.id}`}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <Navigation className="h-4 w-4" /> TRK-LINK
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Timeline & Matrix */}
           <div className="lg:col-span-12 space-y-8">
              {/* Status Visualizer */}
              <div className="p-10 rounded-[3rem] bg-slate-900/40 border border-slate-800/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                    <Clock className="h-40 w-40" />
                 </div>
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Fulfillment Timeline</h3>
                 
                 {order.orderStatus === "cancelled" ? (
                   <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20">
                      <XCircle className="h-10 w-10 text-rose-500" />
                      <div>
                         <p className="font-display font-black text-rose-500 uppercase italic tracking-tight underline decoration-rose-500/30">Operation Voided</p>
                         <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest">Protocol terminated by controller</p>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-wrap items-start justify-between gap-6">
                      {statusSteps.map((step, i) => {
                        const active = i <= currentStep;
                        const pulsate = i === currentStep;
                        return (
                          <div key={step} className={`flex flex-col items-center gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-20'}`}>
                             <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all ${active ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'border-slate-700'}`}>
                                {active ? <CheckCircle2 className="h-6 w-6 text-white" /> : <div className="h-2 w-2 rounded-full bg-slate-700" />}
                             </div>
                             <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-slate-600'}`}>
                                {step}
                             </p>
                             {pulsate && <div className="h-1 w-8 bg-primary rounded-full animate-pulse blur-[1px]" />}
                          </div>
                        );
                      })}
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Procurement Matrix */}
                 <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                       <ShoppingBag className="h-4 w-4 text-emerald-500" /> Itemization Manifest
                    </h3>
                    <div className="space-y-4">
                       {orderItems.map((item, i) => (
                         <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
                            <div>
                               <p className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">{item.name} <span className="text-slate-600 ml-1">×{item.quantity}</span></p>
                               {item.remarks && <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">{item.remarks}</p>}
                            </div>
                            <span className="text-sm font-black text-white">₹{item.price * item.quantity}</span>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800 space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Cumulative Weight</span>
                          <span className="text-slate-300">₹{order.totalAmount}</span>
                       </div>
                       <div className="flex justify-between text-xs font-black text-primary uppercase italic tracking-widest pt-2">
                          <span>System Settlement</span>
                          <span className="text-xl tracking-tighter">₹{order.totalAmount}</span>
                       </div>
                    </div>
                 </div>

                 {/* Vector Data (Address/Contact) */}
                 <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                       <MapPin className="absolute top-0 right-0 p-10 opacity-[0.03] h-32 w-32" />
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Navigation className="h-4 w-4 text-blue-500" /> Coordinate Link
                       </h3>
                       <div className="p-4 rounded-2xl bg-black/30 border border-white/5 mb-4">
                          <p className="text-xs font-bold text-slate-300 leading-relaxed">{order.address || "Zone Data Encrypted"}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                             <Phone className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Comm Link</p>
                             <p className="text-xs font-bold text-slate-200">{order.contact || "Pending Sync"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-amber-500" /> Fiscal Metadata
                       </h3>
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Payment Protocol</p>
                             <p className="text-sm font-black text-white italic uppercase tracking-tight">{order.paymentMethod}</p>
                          </div>
                          <div className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                             Settled
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Control Terminal */}
        <div className="mt-12 pt-10 border-t border-slate-800 flex flex-wrap gap-4">
           {isCancellable && (
             <button onClick={handleCancel}
               className="flex-1 min-w-[200px] h-14 rounded-3xl bg-rose-500 text-white font-display font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
               <XCircle className="h-5 w-5" /> Terminate Operation
             </button>
           )}
           <button onClick={generateBill} disabled={isDownloading}
             className="px-10 h-14 rounded-3xl bg-slate-900 border border-slate-800 text-white font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
             {isDownloading ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <Download className="h-5 w-5 text-primary" />} 
             {isDownloading ? "Processing..." : "Manifest Extraction"}
           </button>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
