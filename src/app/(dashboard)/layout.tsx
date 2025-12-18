"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import { usePathname } from "next/navigation";
import { CommandPaletteProvider } from "@/components/command-palette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  return (
    <ThemeProvider>
      <AuthProvider>
        <CommandPaletteProvider>
          <div className="relative flex min-h-screen w-full">
            {pathName !== "/login" && (
              <div className="w-64">
                <Sidebar />
              </div>
            )}
            <div className="w-full">
              {pathName !== "/login" && <Header />}
              <main className="">{children}</main>
            </div>
          </div>
        </CommandPaletteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
