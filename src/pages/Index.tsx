import React from 'react';
import Hero from '../components/home/Hero';

const Index = () => {
    return (
        <div>
            <Hero />
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                    {['Pizza', 'Burgers', 'Dosa', 'Biryani', 'Cakes', 'Rolls'].map(cat => (
                        <div key={cat} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                                🍔
                            </div>
                            <span className="font-medium">{cat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Index;
