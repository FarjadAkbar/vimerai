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
  title: "VimeraAI - AI Video Generator",
  description: "Create short videos for social media in seconds with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
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
