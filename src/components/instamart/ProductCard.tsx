import React from 'react';

const ProductCard = ({ name, weight, price, image }: any) => {
    return (
        <div className="bg-white border rounded-2xl p-4 hover:shadow-lg transition-shadow">
            <div className="aspect-square mb-4">
                <img src={image} className="w-full h-full object-contain" alt={name} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 h-10 mb-1">{name}</h3>
            <p className="text-xs text-gray-400 mb-4">{weight}</p>
            <div className="flex justify-between items-center">
                <span className="font-bold">₹{price}</span>
                <button className="px-6 py-2 border border-green-600 text-green-600 text-xs font-black rounded-lg hover:bg-green-50 uppercase tracking-tighter">
                    Add
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
