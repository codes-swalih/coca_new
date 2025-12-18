"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, LayoutDashboard, Calendar, ChartBar, Workflow, MapPin, Building2, BookOpen, Shield, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { filterNavItemsByPermissions, NavItem } from "@/config/permissions";

// Icon mapping from string to component
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  ChartBar,
  Workflow,
  MapPin,
  BookOpen,
  Shield,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Get user permissions or empty array if not authenticated
  const permissions = user?.permissions ?? [];
  
  // Filter navigation items based on user permissions
  const visibleNavItems = filterNavItemsByPermissions(permissions);

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex h-full w-56 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="COCA Logo" 
            width={32} 
            height={32} 
          />
          <span className="font-bold">COCA Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {visibleNavItems.map((item: NavItem) => {
            const IconComponent = iconMap[item.icon];
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start mb-2"
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
