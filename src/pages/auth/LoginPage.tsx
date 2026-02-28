import React from 'react';

const LoginPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-800">Login</h1>
                    <p className="text-gray-500 mt-2 font-medium">Welcome back! Please enter your details.</p>
                </div>
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full px-5 py-3 rounded-xl border focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 rounded-xl border focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>
                    <button className="w-full py-4 bg-orange-500 text-white font-black rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-colors">
                        Sign In
                    </button>
                </form>
                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500">Don't have an account? </span>
                    <a href="/signup" className="text-orange-500 font-bold hover:underline">Sign up for free</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
