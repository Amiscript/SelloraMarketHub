// store/utils/authHelpers.ts
import { useAuthStore } from '../auth.store';
import { User } from '../auth.store';

// JWT Payload interface
interface JwtPayload {
  id: string;
  role: string;
  exp: number;
  iat: number;
  email?: string;
  name?: string;
}

// Permission interface for sub-admin
interface SubAdminPermissions {
  permissions?: string[];
}

// Type for user with permissions
type UserWithPermissions = User & Partial<SubAdminPermissions>;

export const authHelpers = {
  // Get auth header for API requests
  getAuthHeader: (): { Authorization: string } | Record<string, never> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Check if user has specific permission
  hasPermission: (permission: string): boolean => {
    const user = useAuthStore.getState().user as UserWithPermissions | null;
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Sub-admin permissions
    if (user.role === 'sub-admin' && user.permissions) {
      return user.permissions.includes(permission);
    }
    
    // Clients have limited permissions - you can define what they can access
    if (user.role === 'client') {
      // Define client permissions here
      const clientPermissions = [
        'view_own_products',
        'manage_own_products',
        'view_own_sales',
        'manage_store_settings',
        'view_own_analytics'
      ];
      return clientPermissions.includes(permission);
    }
    
    return false;
  },

  // Check if user has any of the specified permissions
  hasAnyPermission: (permissions: string[]): boolean => {
    return permissions.some(permission => authHelpers.hasPermission(permission));
  },

  // Check if user has all of the specified permissions
  hasAllPermissions: (permissions: string[]): boolean => {
    return permissions.every(permission => authHelpers.hasPermission(permission));
  },

  // Format store URL
  getStoreUrl: (slug?: string): string => {
    const storeSlug = slug || useAuthStore.getState().user?.storeSlug;
    if (!storeSlug) return '';
    
    return `/store/${storeSlug}`;
  },

  // Get store dashboard URL
  getStoreDashboardUrl: (): string => {
    const user = useAuthStore.getState().user;
    if (!user) return '/client/login';
    
    if (user.role === 'client') {
      return '/client/dashboard';
    } else if (user.role === 'admin') {
      return '/admin/dashboard';
    } else if (user.role === 'sub-admin') {
      return '/sub-admin/dashboard';
    }
    
    return '/';
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Parse JWT token
  parseJwt: (token: string): JwtPayload | null => {
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  },

  // Get token expiration time
  getTokenExpirationTime: (): Date | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = authHelpers.parseJwt(token);
      if (payload?.exp) {
        return new Date(payload.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  },

  // Get time until token expires (in milliseconds)
  getTimeUntilTokenExpiry: (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = authHelpers.parseJwt(token);
      if (payload?.exp) {
        return (payload.exp * 1000) - Date.now();
      }
      return null;
    } catch {
      return null;
    }
  },

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon: (thresholdMinutes: number = 5): boolean => {
    const timeUntilExpiry = authHelpers.getTimeUntilTokenExpiry();
    if (timeUntilExpiry === null) return true;
    
    return timeUntilExpiry < thresholdMinutes * 60 * 1000;
  },

  // Get user role
  getUserRole: (): string | null => {
    const user = useAuthStore.getState().user;
    return user?.role || null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token && !authHelpers.isTokenExpired();
  },

  // Get user display name
  getUserDisplayName: (): string => {
    const user = useAuthStore.getState().user;
    if (!user) return '';
    
    if (user.role === 'client' && user.storeName) {
      return user.storeName;
    }
    
    return user.name || '';
  },

  // Get user initials for avatar
  getUserInitials: (): string => {
    const user = useAuthStore.getState().user;
    if (!user) return '';
    
    const name = user.name || user.storeName || '';
    const nameParts = name.split(' ');
    
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return nameParts[0]?.[0]?.toUpperCase() || '';
  },

  // Check if user is verified
  isUserVerified: (): boolean => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    
    return user.isVerified || user.verificationStatus === 'verified';
  },

  // Get verification status
  getVerificationStatus: (): string => {
    const user = useAuthStore.getState().user;
    if (!user) return 'unknown';
    
    return user.verificationStatus || (user.isVerified ? 'verified' : 'pending');
  },

  // Check if store is active
  isStoreActive: (): boolean => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'client') return false;
    
    return user.storeStatus === 'active';
  },

  // Get store status
  getStoreStatus: (): string => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'client') return 'inactive';
    
    return user.storeStatus || 'pending';
  },

  // Clear auth data
  clearAuthData: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also clear any other auth-related storage items
    sessionStorage.removeItem('auth-storage');
  },

  // Get auth state for debugging
  getAuthState: () => {
    const state = useAuthStore.getState();
    return {
      isAuthenticated: state.isAuthenticated,
      hasToken: !!localStorage.getItem('token'),
      userRole: state.user?.role,
      isVerified: state.user?.isVerified,
      verificationStatus: state.user?.verificationStatus,
      storeStatus: state.user?.storeStatus,
      tokenExpired: authHelpers.isTokenExpired(),
    };
  },

  // Check if user can access specific route based on role
  canAccessRoute: (allowedRoles: string[]): boolean => {
    const userRole = authHelpers.getUserRole();
    if (!userRole) return false;
    
    return allowedRoles.includes(userRole);
  },

  // Get dashboard route based on user role
  getDashboardRoute: (): string => {
    const userRole = authHelpers.getUserRole();
    
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'sub-admin':
        return '/sub-admin/dashboard';
      case 'client':
        return '/client/dashboard';
      default:
        return '/';
    }
  },

  // Check if user has completed required profile fields
  hasCompletedProfile: (): boolean => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    
    if (user.role === 'client') {
      return !!(
        user.phone &&
        user.residentialAddress &&
        user.bankDetails?.accountNumber &&
        user.bankDetails?.bankName
      );
    }
    
    return !!user.name;
  },

  // Get missing profile fields for client
  getMissingProfileFields: (): string[] => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'client') return [];
    
    const missing: string[] = [];
    
    if (!user.phone) missing.push('phone');
    if (!user.residentialAddress) missing.push('residentialAddress');
    if (!user.city) missing.push('city');
    if (!user.state) missing.push('state');
    if (!user.bankDetails?.bankName) missing.push('bankName');
    if (!user.bankDetails?.accountNumber) missing.push('accountNumber');
    if (!user.bankDetails?.accountName) missing.push('accountName');
    if (!user.profileImage) missing.push('profileImage');
    
    return missing;
  },
};

// Export individual functions for easier use
export const {
  getAuthHeader,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getStoreUrl,
  getStoreDashboardUrl,
  isTokenExpired,
  parseJwt,
  getTokenExpirationTime,
  getTimeUntilTokenExpiry,
  isTokenExpiringSoon,
  getUserRole,
  isAuthenticated,
  getUserDisplayName,
  getUserInitials,
  isUserVerified,
  getVerificationStatus,
  isStoreActive,
  getStoreStatus,
  clearAuthData,
  getAuthState,
  canAccessRoute,
  getDashboardRoute,
  hasCompletedProfile,
  getMissingProfileFields,
} = authHelpers;