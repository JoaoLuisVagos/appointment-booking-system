import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthState, UserRole } from "../types";
import { isLojaRole, normalizeRole } from "../roles";

interface ProtectedRouteProps {
  auth: AuthState | null;
  allowedRoles?: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ auth, allowedRoles, children }: ProtectedRouteProps) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const authRole = normalizeRole(auth.role);
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));
    const canAccess = normalizedAllowedRoles.includes(authRole);

    if (!canAccess) {
      const fallback = isLojaRole(auth.role) ? "/loja/dashboard" : "/cliente";
      return <Navigate to={fallback} replace />;
    }
  }

  if (normalizeRole(auth.role) === "vendedor") {
    // Legacy migration: old tokens/users still using 'vendedor' should be routed to the loja area.
    const fallback = "/loja/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
