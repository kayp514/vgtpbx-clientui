import { notFound } from "next/navigation";
import { validateSlug } from "@/app/actions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const isValid = await validateSlug(slug);

  if (!isValid) {
    notFound();
  }

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
