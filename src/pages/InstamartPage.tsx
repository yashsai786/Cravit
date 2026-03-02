import React from 'react';
import ProductCard from '@/components/instamart/ProductCard';
import { INSTAMART_PRODUCTS } from '@/data/instamartData';

const InstamartPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <span className="bg-purple-400/30 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Flash Delivery</span>
                    <h1 className="text-6xl font-black mb-4 tracking-tighter">Instamart</h1>
                    <p className="text-purple-100 text-xl font-medium">Daily essentials delivered in the blink of an eye.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-800">Bestsellers</h2>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm cursor-pointer hover:bg-purple-100">&larr;</div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm cursor-pointer hover:bg-purple-100">&rarr;</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {INSTAMART_PRODUCTS.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InstamartPage;
