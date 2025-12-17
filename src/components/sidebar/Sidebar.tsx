"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, LayoutDashboard, Calendar, ChartBar, Workflow, MapPin, Building2, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();

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
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/members">
            <Button
              variant={pathname === "/members" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Users className="mr-2 h-4 w-4" />
              Members
            </Button>
          </Link>
          <Link href="/club-management">
            <Button
              variant={pathname === "/club-management" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Club Management
            </Button>
          </Link>
          <Link href="/cocaEvents">
            <Button
              variant={pathname === "/cocaEvents" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Coca Events
            </Button>
          </Link>
          <Link href="/advertisement">
            <Button
              variant={pathname === "/advertisement" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <ChartBar className="mr-2 h-4 w-4" />
              Advertisements
            </Button>
          </Link>
          <Link href="/services">
            <Button
              variant={pathname === "/services" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Workflow className="mr-2 h-4 w-4" />
              Services
            </Button>
          </Link>
          <Link href="/zone-management">
            <Button
              variant={pathname === "/zone-management" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Zone Management
            </Button>
          </Link>
          <Link href="/bookings">
            <Button
              variant={pathname === "/bookings" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Bookings
            </Button>
          </Link>
          <Link href="/role-management">
            <Button
              variant={pathname === "/role-management" ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Shield className="mr-2 h-4 w-4" />
              Role Management
            </Button>
          </Link>
        </nav>
      </ScrollArea>
    </div>
  );
}