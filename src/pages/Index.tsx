import React from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import RestaurantCard from '@/components/home/RestaurantCard';
import { RESTAURANTS, CATEGORIES } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Index = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <Hero />
            <div className="container mx-auto px-4 py-12">
                <section className="mb-12">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-black text-gray-800">What's on your mind?</h2>
                        <Button variant="ghost" className="text-orange-500 font-bold">View more &rarr;</Button>
                    </div>
                    <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer group">
                                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-4xl shadow-sm border border-transparent group-hover:border-orange-200 group-hover:bg-white transition-all duration-300">
                                    {cat.icon}
                                </div>
                                <span className="font-bold text-gray-600 group-hover:text-orange-600 transition-colors uppercase text-[10px] tracking-widest">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-black text-gray-800 mb-8 items-baseline flex gap-3">
                        Top Restaurants In Delhi
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-tighter">Verified Chains</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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
