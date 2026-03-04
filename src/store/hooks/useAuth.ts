// store/hooks/useAuth.ts
import { useAuthStore } from '../auth.store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export const useAuth = () => {
  const {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    validationErrors,
    storeUrl,
    
    // Actions
    login,
    logout,
    registerClient,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateProfile,
    clearError,
    clearValidationErrors,
    setAuthFromStorage,
  } = useAuthStore();

  // Check if user is client
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const isSubAdmin = user?.role === 'sub-admin';
  
  // Check if client is verified
  const isVerified = user?.isVerified || user?.verificationStatus === 'verified';
  
  // Check if store is active
  const isStoreActive = user?.storeStatus === 'active';
  
  // Get user's full name
  const userName = user?.name || '';
  
  // Get user's email
  const userEmail = user?.email || '';
  
  // Get store slug
  const storeSlug = user?.storeSlug || '';
  
  // Check if user has completed profile
  const hasCompletedProfile = !!(user?.phone && user?.residentialAddress && user?.bankDetails);

  // Effect to check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated && !isLoading) {
        await getCurrentUser();
      }
    };
    
    checkAuth();
  }, []); // Only run once on mount

  // Helper function to get field error
  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors?.find(err => err.field === fieldName)?.message;
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors?.some(err => err.field === fieldName) || false;
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    validationErrors,
    storeUrl,
    
    // User info
    userName,
    userEmail,
    storeSlug,
    
    // Role checks
    isClient,
    isAdmin,
    isSubAdmin,
    isVerified,
    isStoreActive,
    hasCompletedProfile,
    
    // Actions
    login,
    logout,
    registerClient,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateProfile,
    clearError,
    clearValidationErrors,
    setAuthFromStorage,
    
    // Helper functions
    getFieldError,
    hasFieldError,
  };
};

// Separate custom hooks for route protection
export const useRequireAuth = (redirectTo: string = '/client/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (roles: string[], redirectTo: string = '/') => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (!isAuthenticated) {
        hasRedirected.current = true;
        navigate('/client/login');
      } else if (!roles.includes(user?.role || '')) {
        hasRedirected.current = true;
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user?.role, navigate, redirectTo]);

  return { user, isAuthenticated, isLoading };
};

export const useRequireVerifiedClient = (redirectTo: string = '/client/verify') => {
  const { user, isClient, isVerified, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (!isAuthenticated) {
        hasRedirected.current = true;
        navigate('/client/login');
      } else if (isClient && !isVerified) {
        hasRedirected.current = true;
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, isClient, isVerified, navigate, redirectTo]);

  return { user, isVerified, isAuthenticated, isLoading };
};

// Hook for admin routes
export const useRequireAdmin = (redirectTo: string = '/admin/login') => {
  return useRequireRole(['admin'], redirectTo);
};

// Hook for client routes
export const useRequireClient = (redirectTo: string = '/client/login') => {
  return useRequireRole(['client'], redirectTo);
};

// Hook for sub-admin routes
export const useRequireSubAdmin = (redirectTo: string = '/sub-admin/login') => {
  return useRequireRole(['sub-admin'], redirectTo);
};

// Hook to check if user has specific permission
export const usePermission = (permission: string) => {
  const { user } = useAuth();
  
  // Admin has all permissions
  if (user?.role === 'admin') return true;
  
  // Check sub-admin permissions
  if (user?.role === 'sub-admin' && (user as any).permissions) {
    return (user as any).permissions.includes(permission);
  }
  
  return false;
};

// Hook to get store URL
export const useStoreUrl = () => {
  const { storeUrl, storeSlug } = useAuth();
  
  if (storeUrl) return storeUrl;
  if (storeSlug) {
    return `${import.meta.env.VITE_CLIENT_URL || 'https://sellora-backend.onrender.com'}/store/${storeSlug}`;
  }
  return null;
};