import React from 'react';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <div className="text-2xl font-bold text-orange-500">Cravit</div>
                <nav className="hidden md:flex space-x-6 font-medium">
                    <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
                    <a href="/offers" className="hover:text-orange-500 transition-colors">Offers</a>
                    <a href="/help" className="hover:text-orange-500 transition-colors">Help</a>
                    <a href="/cart" className="hover:text-orange-500 transition-colors">Cart</a>
                </nav>
                <button className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                    Login
                </button>
            </div>
        </header>
    );
};

export default Header;
