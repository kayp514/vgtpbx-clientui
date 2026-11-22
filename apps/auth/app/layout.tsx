import type { Metadata } from "next";
import localFont from "next/font/local";
import { TernSecureProvider } from "@tern-secure/nextjs";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TernSecure Auth",
  description:
    "TernSecure Auth is a secure authentication solution for modern web applications.",
};

export const instant = false

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      
          <TernSecureProvider
            appName="TernSecureAuth"
            ternUIUrl="https://cdn.jsdelivr.net/npm/@tern-secure/auth@1.1.0-canary.v20260103004539/dist/ternsecure.browser.js"
            persistence="browserCookie"
            apiUrl='localhost:5001'
            requiresVerification={false}
          >
            {children}
          </TernSecureProvider>
      
      </body>
    </html>
  );
}
