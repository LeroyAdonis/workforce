"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "worker" | "manager" | "admin";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        if (requiredRole) {
          const userRole = (session.user as any).role || "worker";
          const roleHierarchy = ["worker", "manager", "admin"];
          const userRoleIndex = roleHierarchy.indexOf(userRole);
          const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

          if (userRoleIndex < requiredRoleIndex) {
            router.push("/unauthorized");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  return <>{children}</>;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "worker" | "manager" | "admin",
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
