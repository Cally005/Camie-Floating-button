// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Import global styles
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarProvider and SidebarTrigger
import MySidebar from "./sidebar"; // Import Sidebar from the app directory

import { ThemeProvider } from "@/components/ui/theme-provider";
import FloatingButton from "./buttons/FloatingButton";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Dashboard for marketing agency clients",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
        <SidebarProvider> {/* Wrap the sidebar with SidebarProvider */}
          <MySidebar /> {/* Include the Sidebar here */}
          <main className="flex-1 p-4"> {/* Ensure main content is styled properly */}
            <SidebarTrigger /> {/* Include SidebarTrigger for toggling */}
            <FloatingButton />
            {children}
          </main>
        </SidebarProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}