import React from 'react';
import Header from './components/layout/Header';
import Index from './pages/Index';

const App = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
                <Index />
            </main>
            <footer className="py-10 bg-gray-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-4">Cravit</div>
                    <p className="text-gray-400 max-w-xs mx-auto mb-6 text-sm">
                        Deliver happiness to your door with every order. Your favorite food is just a click away.
                    </p>
                    <div className="flex justify-center space-x-6 text-gray-400 text-sm">
                        <span>© 2026 Cravit</span>
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
