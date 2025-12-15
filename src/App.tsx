import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminMenu from "./pages/admin/Menu";
import AdminCustomers from "./pages/admin/Customers";
import AdminBanners from "./pages/admin/Banners";
import AdminWhatsApp from "./pages/admin/WhatsApp";
import AdminSettings from "./pages/admin/Settings";
import StoreFront from "./pages/store/StoreFront";
import StoreProduct from "./pages/store/Product";
import StoreCart from "./pages/store/Cart";
import StoreCheckout from "./pages/store/Checkout";
import StoreConfirmation from "./pages/store/Confirmation";
import StoreTrack from "./pages/store/Track";

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
              <Route path="/" element={<Index />} />
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/whatsapp" element={<AdminWhatsApp />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              {/* Store Routes */}
              <Route path="/r/:slug" element={<StoreFront />} />
              <Route path="/r/:slug/product/:id" element={<StoreProduct />} />
              <Route path="/r/:slug/cart" element={<StoreCart />} />
              <Route path="/r/:slug/checkout" element={<StoreCheckout />} />
              <Route path="/r/:slug/confirmation/:code" element={<StoreConfirmation />} />
              <Route path="/track/:code" element={<StoreTrack />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
