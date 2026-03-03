import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Index from './pages/Index';
import RestaurantPage from './pages/RestaurantPage';
import InstamartPage from './pages/InstamartPage';
import LoginPage from './pages/auth/LoginPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import RestaurantDashboard from './pages/dashboard/RestaurantDashboard';
import DeliveryDashboard from './pages/dashboard/DeliveryDashboard';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="min-h-screen bg-white flex flex-col selection:bg-orange-100 selection:text-orange-900">
                        <Header />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/restaurant/:id" element={<RestaurantPage />} />
                                <Route path="/instamart" element={<InstamartPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/orders" element={<OrdersPage />} />
                                <Route path="/checkout" element={<CheckoutPage />} />
                                <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
                                <Route path="/dashboard/delivery" element={<DeliveryDashboard />} />
                            </Routes>
                        </main>
                        <footer className="bg-gray-950 text-gray-500 py-20 px-6 mt-20">
                            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                                <div className="col-span-1">
                                    <div className="text-3xl font-black text-orange-500 mb-6">Cravit.</div>
                                    <p className="text-sm leading-relaxed max-w-xs">
                                        Revolutionizing the way you eat. Bringing the best flavors from your city's kitchen straight to your table.
                                    </p>
                                </div>
                                {/* Footer links sections... */}
                            </div>
                        </footer>
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
