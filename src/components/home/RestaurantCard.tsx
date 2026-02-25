import React from 'react';

const RestaurantCard = ({ name, rating, cuisine, time, image, discount }: any) => {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-3 shadow-sm border">
                <img
                    src={image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop"}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-black uppercase">
                        {discount}
                    </div>
                )}
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{name}</h3>
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 mt-1">
                    <span className="text-green-600">★</span>
                    <span>{rating}</span>
                    <span>•</span>
                    <span>{time} mins</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{cuisine}</p>
            </div>
        </div>
    );
};

export default RestaurantCard;
