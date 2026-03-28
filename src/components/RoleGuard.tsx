import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRole, redirectTo = "/login" }) => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !userProfile) {
      navigate(redirectTo);
    } else if (!loading && userProfile && requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(userProfile.role)) {
        // Redirection logic for when user is logged in but doesn't have the right role
        // Redirect to their default panel
        switch (userProfile.role) {
          case "admin":
            navigate("/admin");
            break;
          case "restaurant_owner":
            navigate("/restaurant");
            break;
          case "delivery_partner":
            navigate("/delivery");
            break;
          case "insta_handler":
            navigate("/insta-handler");
            break;
          case "customer":
          default:
            navigate("/dashboard");
            break;
        }
      }
    }
  }, [userProfile, loading, requiredRole, redirectTo, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) return null;

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userProfile.role)) {
      return null;
    }
  }

  return <>{children}</>;
};
