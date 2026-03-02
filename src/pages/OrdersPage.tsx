import React from 'react';

const OrdersPage = () => {
    const pastOrders = [
        { id: 'ORD123', restaurant: 'Sagar Ratna', status: 'Delivered', date: 'Mar 02, 2026', total: 450, itemsCount: 3 },
        { id: 'ORD456', restaurant: 'Burger King', status: 'Delivered', date: 'Feb 28, 2026', total: 299, itemsCount: 1 },
        { id: 'ORD789', restaurant: 'La Pinoz', status: 'Cancelled', date: 'Feb 20, 2026', total: 600, itemsCount: 2 }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-black mb-10">Your Orders</h1>
                <div className="space-y-6">
                    {pastOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                                    🍴
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{order.restaurant}</h3>
                                    <p className="text-sm text-gray-400 font-medium">{order.date} • {order.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-10 w-full md:w-auto justify-between border-t md:border-0 pt-4 md:pt-0">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Amount</p>
                                    <p className="font-bold text-lg text-gray-800">₹{order.total}</p>
                                </div>
                                <button className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 font-black rounded-xl text-xs uppercase tracking-tighter hover:bg-orange-50 transition-colors whitespace-nowrap">
                                    View Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
