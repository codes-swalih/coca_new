"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative flex min-h-screen w-full">
          {pathName !== "/login" && (
            <div className=" w-64">
              <Sidebar />
            </div>
          )}
          <div className="w-full mt-5">
            {pathName !== "/login" && <Header />}
            <main className="">{children}</main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
