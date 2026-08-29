import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/theme/themeprovider";
import { ToastContainer } from 'react-toastify';
import { QueryProvider } from "@/lib/providers/query-provider";
import { AppStateProvider } from "@/lib/providers/app-state-provider";
import "./globals.css";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vimerai — Create 100+ Viral Posts in 1 Minute",
  description:
    "Turn Business DNA into feed-ready Instagram posts and videos. Create in Brand Studio, export, and post when you're ready.",
};

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
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppStateProvider>
              <Header />
              {children}
              <ToastContainer />
            </AppStateProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
