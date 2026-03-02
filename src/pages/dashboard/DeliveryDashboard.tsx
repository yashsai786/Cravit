import React from 'react';

const DeliveryDashboard = () => {
    const activeOrders = [
        { id: 'DR101', restaurant: 'Sagar Ratna', destination: 'Sector 44, Gurgaon', time: '12 mins left', distance: '2.4 km' }
    ];

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Delivery Dashboard</h1>
                        <p className="text-gray-500 text-sm font-medium">You are currently ONLINE</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black">
                        JD
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold">Active Deliveries</h2>
                        {activeOrders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{order.id}</span>
                                        <h3 className="text-xl font-bold">{order.restaurant}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-orange-500">{order.time}</p>
                                        <p className="text-xs text-gray-400 font-bold">{order.distance}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <p className="text-sm font-medium text-gray-500">Pickup: {order.restaurant}</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <p className="text-sm font-medium text-gray-700 font-bold">Drop: {order.destination}</p>
                                    </div>
                                </div>
                                <button className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest">
                                    Order Picked Up
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-3xl border shadow-sm h-fit">
                        <h2 className="text-lg font-bold mb-6">Earnings Today</h2>
                        <p className="text-4xl font-black text-gray-800 mb-2">₹1,240</p>
                        <p className="text-sm text-green-600 font-bold mb-8">+12.5% from yesterday</p>
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Orders Completed</span>
                                <span className="font-black">08</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Incentives</span>
                                <span className="font-black">₹150</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
