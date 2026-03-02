import React from 'react';

const RestaurantDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* BUG: Fixed width sidebar without responsive hiding will break mobile layout */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h2 className="font-bold">Dashboard</h2>
      </div>
      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-black">Orders Overview</h1>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
