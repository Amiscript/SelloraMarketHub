import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import SalesManagement from "./pages/admin/SalesManagement";
import ClientManagement from "./pages/admin/ClientManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import CarouselManagement from "./pages/admin/CarouselManagement";
import SubAdminManagement from "./pages/admin/SubAdminManagement";
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProducts from "./pages/client/ClientProducts";
import ClientSales from "./pages/client/ClientSales";
import ClientPayments from "./pages/client/ClientPayments";
import ClientSettings from "./pages/client/ClientSettings";
import ClientCarousel from "./pages/client/ClientCarousel";
import ClientWallet from "./pages/client/ClientWallet";
import Clientorder from "./pages/client/ClientOrders";
import UserStorefront from "./pages/user/UserStorefront";
import ChatLayout from "../src/components/layout/chatLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <ChatLayout chatType="store" storeName="MarketHub Support">
              <Index />
            </ChatLayout>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ChatLayout chatType="admin">
              <AdminDashboard />
            </ChatLayout>
          }>
            <Route path="sales" element={<SalesManagement />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="carousel" element={<CarouselManagement />} />
            <Route path="sub-admins" element={<SubAdminManagement />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/dashboard" element={
            <ChatLayout chatType="client">
              <ClientDashboard />
            </ChatLayout>
          }>
            <Route path="products" element={<ClientProducts />} />
            <Route path="sales" element={<ClientSales />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="carousel" element={<ClientCarousel />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="wallet" element={<ClientWallet />} />
            <Route path="orders" element={<Clientorder />} />
          </Route>
          
          {/* User Storefront */}
          <Route path="/store/:storeSlug" element={
            <ChatLayout 
              chatType="store" 
              storeName={window.location.pathname.split('/')[2] || "Store"}
            >
              <UserStorefront />
            </ChatLayout>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;