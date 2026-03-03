import React from 'react';

const RestaurantDashboard = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* FIXED: Added hidden on mobile class and responsive flex layout */}
      <div className="hidden md:block w-64 bg-gray-900 text-white p-6">
        <h2 className="font-bold">Dashboard</h2>
      </div>
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-black">Orders Overview</h1>
        <div className="md:hidden bg-orange-100 p-4 rounded-xl mt-4">
          Mobile Navbar Placeholder
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
