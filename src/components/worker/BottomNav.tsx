"use client";

import { LayoutDashboard, ListTodo, User, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/worker/dashboard" },
    { label: "Tasks", icon: ListTodo, href: "/worker/tasks" },
    { label: "Notifications", icon: Bell, href: "/worker/notifications" },
    { label: "Profile", icon: User, href: "/worker/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 h-16 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium uppercase tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
