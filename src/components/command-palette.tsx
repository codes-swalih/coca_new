"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  MapPin,
  Building2,
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  Megaphone,
  Briefcase,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTE_PERMISSIONS } from "@/config/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const allNavigationItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview and statistics" },
  { name: "Zone Management", href: "/zone-management", icon: MapPin, description: "Manage states, districts, zones & chapters" },
  { name: "Club Management", href: "/club-management", icon: Building2, description: "Manage clubs and registrations" },
  { name: "Members", href: "/members", icon: Users, description: "View and manage members" },
  { name: "Events", href: "/cocaEvents", icon: Calendar, description: "Create and manage events" },
  { name: "Services", href: "/services", icon: Briefcase, description: "Manage available services" },
  { name: "Advertisement", href: "/advertisement", icon: Megaphone, description: "Manage advertisements" },
  { name: "Bookings", href: "/bookings", icon: BookOpen, description: "View and manage bookings" },
  { name: "Role Management", href: "/role-management", icon: Settings, description: "Manage roles and permissions" },
];

interface CommandPaletteContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Filter navigation items based on user permissions
  const filteredItems = useMemo(() => {
    if (!user) return [];
    
    return allNavigationItems.filter((item) => {
      const requiredPermission = ROUTE_PERMISSIONS[item.href];
      // If no permission required, show to all authenticated users
      if (!requiredPermission) return true;
      // Check if user has the required permission
      return user.permissions.includes(requiredPermission);
    });
  }, [user]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search modules..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {filteredItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                className="flex items-center gap-3 py-3"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
