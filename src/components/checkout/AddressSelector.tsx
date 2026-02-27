import React from 'react';

const AddressSelector = () => {
    const addresses = [
        { id: 1, type: 'Home', address: 'B-123, Lajpat Nagar, New Delhi - 110024' },
        { id: 2, type: 'Work', address: 'Cyber City, Phase 3, Gurgaon, Haryana - 122002' }
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Select Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                    <div key={addr.id} className="p-4 border-2 border-orange-500 rounded-xl bg-orange-50 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">
                                {addr.type}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {addr.address}
                        </p>
                    </div>
                ))}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 font-bold cursor-pointer hover:border-orange-200 transition-colors">
                    + Add New Address
                </div>
            </div>
        </div>
    );
};

export default AddressSelector;
