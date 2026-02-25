import React from 'react';
import Hero from '../components/home/Hero';
import RestaurantCard from '../components/home/RestaurantCard';
import { RESTAURANTS, CATEGORIES } from '../data/mockData';

const Index = () => {
    return (
        <div>
            <Hero />
            <div className="container mx-auto px-4 py-12">
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-8">What's on your mind?</h2>
                    <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm border group-hover:bg-orange-50 transition-colors">
                                    {cat.icon}
                                </div>
                                <span className="font-medium text-gray-700">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        Top restaurant chains
                        <span className="text-sm font-normal text-gray-400">({RESTAURANTS.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {RESTAURANTS.map(res => (
                            <RestaurantCard key={res.id} {...res} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Index;
