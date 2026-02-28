import React from 'react';

const SideFilter = () => {
    const categories = [
        'All Products',
        'Modern Dairy',
        'The Fruit Shop',
        'Farmers Market',
        'Meat House',
        'The Bakery'
    ];

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block border-r pr-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Filter by Category</h3>
            <ul className="space-y-4">
                {categories.map((cat, i) => (
                    <li
                        key={i}
                        className={`cursor-pointer font-bold text-sm ${i === 0 ? 'text-purple-600' : 'text-gray-500 hover:text-purple-400'} transition-colors`}
                    >
                        {cat}
                    </li>
                ))}
            </ul>

            <div className="mt-12">
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Price Range</h3>
                <input type="range" className="w-full accent-purple-600" />
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                    <span>₹0</span>
                    <span>₹1000+</span>
                </div>
            </div>
        </aside>
    );
};

export default SideFilter;
