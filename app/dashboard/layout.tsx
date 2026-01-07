"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <DashboardLayout>
        {children}
        <Toaster position="top-center" />
      </DashboardLayout>
    </ThemeProvider>
  );
}
