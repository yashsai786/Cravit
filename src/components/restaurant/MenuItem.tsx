import React from 'react';

const MenuItem = ({ name, price, description, isVeg }: any) => {
    return (
        <div className="flex justify-between items-center py-8 border-b last:border-0 group">
            <div className="flex-grow pr-8">
                <div className={`w-4 h-4 border-2 ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px] mb-2`}>
                    <div className={`w-full h-full rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
                <p className="text-sm font-semibold mb-2">₹{price}</p>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{description}</p>
            </div>
            <div className="flex-shrink-0 relative">
                <div className="w-32 h-32 rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                    <img
                        src={`https://source.unsplash.com/random/200x200?food,${name}`}
                        className="w-full h-full object-cover"
                        alt={name}
                    />
                </div>
                <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-green-600 font-black px-8 py-2 rounded-lg shadow-lg border hover:bg-gray-50 transition-colors uppercase text-sm">
                    Add
                </button>
            </div>
        </div>
    );
};

export default MenuItem;
