"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <CartProvider>
                    <ToastContainer />
                    {children}
                </CartProvider>
            </ToastProvider>
        </SessionProvider>
    );
}
