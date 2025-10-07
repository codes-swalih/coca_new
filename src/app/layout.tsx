import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "COCA",
  description: "Central Organization of Camera Artists",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
      <html lang="en">
        <body>

              

              {children}
       
        </body>
      </html>
  );
}

export default RootLayout;