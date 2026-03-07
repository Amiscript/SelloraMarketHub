import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
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
import SubAdminLogin from "./pages/admin/SubAdminLogin";
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProducts from "./pages/client/ClientProducts";
import ClientSales from "./pages/client/ClientSales";
import ClientPayments from "./pages/client/ClientPayments";
import ClientSettings from "./pages/client/ClientSettings";
import ClientCarousel from "./pages/client/ClientCarousel";
import ClientWallet from "./pages/client/ClientWallet";
import ClientOrders from "./pages/client/ClientOrders";
import VerifyEmail from "../src/pages/client/VerifyEmail";
import UserStorefront from "./pages/user/UserStorefront";
import OrderVerify from "./pages/user/OrderVerify";
import OrderTracking from "./pages/user/OrderTracking";
import ChatLayout from "./components/layout/chatLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerificationPending from "@/pages/client/VerificationPending";
import ResendVerification from "@/pages/client/ResendVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <ChatLayout chatType="store" storeName="MarketHub Support">
                <Index />
              </ChatLayout>
            } />

            {/* Shared Auth Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin">
              <Route path="login" element={<AdminLogin />} />
              <Route path="sub-admin/login" element={<SubAdminLogin />} />
              <Route path="dashboard" element={<ChatLayout chatType="admin"><AdminDashboard /></ChatLayout>} />
              <Route path="sales" element={<ChatLayout chatType="admin"><SalesManagement /></ChatLayout>} />
              <Route path="clients" element={<ChatLayout chatType="admin"><ClientManagement /></ChatLayout>} />
              <Route path="orders" element={<ChatLayout chatType="admin"><AdminOrders /></ChatLayout>} />
              <Route path="payments" element={<ChatLayout chatType="admin"><PaymentManagement /></ChatLayout>} />
              <Route path="products" element={<ChatLayout chatType="admin"><ProductManagement /></ChatLayout>} />
              <Route path="carousel" element={<ChatLayout chatType="admin"><CarouselManagement /></ChatLayout>} />
              <Route path="sub-admins" element={<ChatLayout chatType="admin"><SubAdminManagement /></ChatLayout>} />
            </Route>

            {/* Client Routes */}
            <Route path="/client">
              <Route path="login" element={<ClientLogin />} />
              <Route path="register" element={<ClientRegister />} />
              <Route path="verification-pending" element={<VerificationPending />} />
              <Route path="resend-verification" element={<ResendVerification />} />
              <Route path="verify-email/:token" element={<VerifyEmail />} />
              <Route path="dashboard" element={<ChatLayout chatType="client"><ClientDashboard /></ChatLayout>} />
              <Route path="products" element={<ChatLayout chatType="client"><ClientProducts /></ChatLayout>} />
              <Route path="sales" element={<ChatLayout chatType="client"><ClientSales /></ChatLayout>} />
              <Route path="payments" element={<ChatLayout chatType="client"><ClientPayments /></ChatLayout>} />
              <Route path="carousel" element={<ChatLayout chatType="client"><ClientCarousel /></ChatLayout>} />
              <Route path="settings" element={<ChatLayout chatType="client"><ClientSettings /></ChatLayout>} />
              <Route path="wallet" element={<ChatLayout chatType="client"><ClientWallet /></ChatLayout>} />
              <Route path="orders" element={<ChatLayout chatType="client"><ClientOrders /></ChatLayout>} />
            </Route>

            {/* Order Routes (public) */}
            <Route path="/order/verify" element={<OrderVerify />} />
            <Route path="/order/track" element={<OrderTracking />} />

            {/* User Storefront */}
            <Route path="/store/:storeSlug" element={
              <ChatLayout chatType="store" storeName="Store">
                <UserStorefront />
              </ChatLayout>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;