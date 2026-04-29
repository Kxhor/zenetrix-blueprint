import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Redirects to the appropriate login page if the user role doesn't match.
 * Renders nothing while the redirect is in flight.
 */
export function useRequireRole(role: "user" | "admin") {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: role === "admin" ? "/admin/login" : "/login" });
      return;
    }
    if (user.role !== role) {
      navigate({ to: role === "admin" ? "/admin/login" : "/login" });
    }
  }, [user, role, navigate]);

  return user && user.role === role ? user : null;
}
