"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Sidebar } from "@/components/sidebar/Sidebar";
import  Header  from "@/components/header/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen w-full">
        <div className=" w-64">

        <Sidebar />
        </div>
        <div className="w-full mt-5">
          <Header />
          <main className="">
            {children}
          </main>
        </div>
      </div> 
    </ThemeProvider>
  );
}