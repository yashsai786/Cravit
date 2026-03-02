import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OrderTrackingPage = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Card className="rounded-3xl border-none shadow-2xl shadow-orange-100 overflow-hidden">
                <div className="bg-orange-500 p-8 text-white relative">
                    <Badge className="absolute top-8 right-8 bg-white/20 text-white border-none backdrop-blur-md">Live Status</Badge>
                    <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Estimated Delivery</p>
                    <h2 className="text-5xl font-black italic tracking-tighter">24 MINS</h2>
                </div>
                <CardContent className="p-8 space-y-8">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">🚴</div>
                        <div>
                            <p className="font-black text-gray-800">Rahul is on his way</p>
                            <p className="text-sm text-gray-500 font-medium">Picking up your order from Sagar Ratna</p>
                        </div>
                    </div>

                    <div className="relative pl-6 space-y-12">
                        <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-orange-100 italic"></div>
                        {[
                            { label: 'Order Confirmed', time: '12:45 PM', completed: true },
                            { label: 'Food is being prepared', time: '12:50 PM', completed: true },
                            { label: 'Out for delivery', time: 'Just now', completed: false },
                            { label: 'Delivered', time: 'Expected 1:15 PM', completed: false }
                        ].map((step, i) => (
                            <div key={i} className={`relative flex justify-between items-center ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`absolute -left-7 w-3 h-3 rounded-full border-2 border-white ${step.completed ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                                <span className="font-bold text-sm">{step.label}</span>
                                <span className="text-[10px] font-black text-gray-400">{step.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <button className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all">
                CALL DELIVERY PARTNER
            </button>
        </div>
    );
};

export default OrderTrackingPage;
