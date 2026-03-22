import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthState, UserRole } from "../types";

interface ProtectedRouteProps {
  auth: AuthState | null;
  requiredRole?: UserRole;
  children: ReactNode;
}

export function ProtectedRoute({ auth, requiredRole, children }: ProtectedRouteProps) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    // If user is logged in but doesn't have the correct role, send them to their default page
    const fallback = auth.role === "vendedor" ? "/vendedor" : "/cliente";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
