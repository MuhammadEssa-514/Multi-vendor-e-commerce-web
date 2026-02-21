
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import WelcomePopup from "@/components/WelcomePopup";
import { Toaster } from "sonner";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BroMart 514 - Online Shopping in Pakistan",
  description: "Best online shopping experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-900`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <Suspense fallback={null}>
            <WelcomePopup />
          </Suspense>
          <Toaster position="top-right" richColors />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
