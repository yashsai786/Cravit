import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import FeedbackPage from "./pages/FeedbackPage";
import InstamartPage from "./pages/InstamartPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import DeliveryDashboard from "./pages/dashboard/DeliveryDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import InstamartDashboard from "./pages/dashboard/InstamartDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Customer */}
              <Route path="/" element={<Index />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order/:id" element={<OrderDetailPage />} />
              <Route path="/track/:id" element={<OrderTrackingPage />} />
              <Route path="/feedback/:id" element={<FeedbackPage />} />
              <Route path="/instamart" element={<InstamartPage />} />
              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Dashboards */}
              <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
              <Route path="/dashboard/restaurant/*" element={<RestaurantDashboard />} />
              <Route path="/dashboard/delivery" element={<DeliveryDashboard />} />
              <Route path="/dashboard/delivery/*" element={<DeliveryDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
              <Route path="/dashboard/instamart" element={<InstamartDashboard />} />
              <Route path="/dashboard/instamart/*" element={<InstamartDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
