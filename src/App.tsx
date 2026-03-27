import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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
import ProductIssues from "./pages/admin/ProductIssues";
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
import UserStorefront from "./pages/user/UserStorefront";
import ChatLayout from "./components/layout/chatLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerificationPending from "@/pages/client/VerificationPending";
import ResendVerification from "@/pages/client/ResendVerification";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

// Wrapper reads :storeSlug from URL and passes it to ChatLayout
const StorefrontWithChat = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  return (
    <ChatLayout chatType="store" storeName={storeSlug} storeSlug={storeSlug}>
      <UserStorefront />
    </ChatLayout>
  );
};

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
          
          {/* Auth Routes (Shared) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Admin Routes Group */}
          <Route path="/admin">
            <Route path="login" element={<AdminLogin />} />
            <Route path="dashboard" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><AdminDashboard /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="sales" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><SalesManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="clients" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><ClientManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><AdminOrders /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><PaymentManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="products" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><ProductManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="carousel" element={
              <ProtectedRoute roles={["admin","sub-admin"]}>
                <ChatLayout chatType="admin"><CarouselManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="sub-admins" element={
              <ProtectedRoute roles={["admin"]}>
                <ChatLayout chatType="admin"><SubAdminManagement /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="product-issues" element={
              <ProtectedRoute roles={["admin", "sub-admin"]}>
                <ChatLayout chatType="admin"><ProductIssues /></ChatLayout>
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Client Routes Group */}
          <Route path="/client">
            {/* Public Client Routes */}
            <Route path="login" element={<ClientLogin />} />
            <Route path="register" element={<ClientRegister />} />
            <Route path="verification-pending" element={<VerificationPending />} />
            <Route path="resend-verification" element={<ResendVerification />} />
            
            {/* Protected Client Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientDashboard /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="products" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientProducts /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="sales" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientSales /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientPayments /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="carousel" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientCarousel /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientSettings /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="wallet" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientWallet /></ChatLayout>
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute roles={["client"]}>
                <ChatLayout chatType="client"><ClientOrders /></ChatLayout>
              </ProtectedRoute>
            } />
          </Route>
          
          {/* User Storefront */}
          <Route path="/store/:storeSlug" element={<StorefrontWithChat />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;