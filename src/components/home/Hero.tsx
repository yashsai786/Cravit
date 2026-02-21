import React from 'react';

const Hero = () => {
    return (
        <div className="relative py-20 bg-orange-50 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    Craving something delicious?
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                    Order from your favorite restaurants and get it delivered to your doorstep in minutes.
                </p>
                <div className="flex w-full max-w-lg bg-white p-2 rounded-xl shadow-lg border">
                    <input
                        type="text"
                        placeholder="Enter your delivery location..."
                        className="flex-grow px-4 outline-none text-gray-700"
                    />
                    <button className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                        FIND FOOD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
