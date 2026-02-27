import React from 'react';
import { useParams } from 'react-router-dom';

const RestaurantPage = () => {
    const { id } = useParams();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-2 text-gray-800">Restaurant {id}</h1>
                    <p className="text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        North Indian, Chinese, Continental
                    </p>
                    <p className="text-gray-500 font-medium">Lajpat Nagar, Delhi</p>
                </div>
                <div className="border rounded-xl p-3 text-center shadow-sm">
                    <div className="text-green-600 font-black border-b pb-2 mb-2">★ 4.2</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">1K+ ratings</div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Menu Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 rounded-2xl bg-gray-200 animate-pulse"></div>
                    <div className="h-48 rounded-2xl bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantPage;
