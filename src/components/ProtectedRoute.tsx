import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  requireVerified?: boolean;
}

const ProtectedRoute = ({ children, roles, requireVerified = false }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  // Not authenticated at all
  if (!token || !user) {
    const isAdminPath = location.pathname.startsWith("/admin");
    return <Navigate to={isAdminPath ? "/admin/login" : "/client/login"} state={{ from: location }} replace />;
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    // Sub-admins and admins redirect to admin dashboard
    if (user.role === "admin" || user.role === "sub-admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Clients redirect to client dashboard
    return <Navigate to="/client/dashboard" replace />;
  }

  // Verification check for clients
  if (requireVerified && user.role === "client") {
    const clientUser = user as any;
    if (clientUser.verificationStatus !== "verified") {
      return <Navigate to="/client/pending-verification" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
