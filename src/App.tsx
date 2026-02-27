import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Index from './pages/Index';
import RestaurantPage from './pages/RestaurantPage';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/restaurant/:id" element={<RestaurantPage />} />
                    </Routes>
                </main>
                <footer className="py-10 bg-gray-900 text-white">
                    {/* Footer content... */}
            </div>
        </div>
    </Router >
  );
};

export default App;
