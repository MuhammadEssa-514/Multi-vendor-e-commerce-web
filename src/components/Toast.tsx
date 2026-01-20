"use client";

import React from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        pointer-events-auto
                        flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-2xl backdrop-blur-md border animate-in slide-in-from-right-10 fade-in duration-500
                        ${toast.type === "success" ? "bg-green-500/90 text-white border-green-400" : ""}
                        ${toast.type === "error" ? "bg-rose-500/90 text-white border-rose-400" : ""}
                        ${toast.type === "info" ? "bg-gray-900/90 text-white border-gray-700" : ""}
                    `}
                >
                    <div className="flex-shrink-0">
                        {toast.type === "success" && <CheckCircle2 size={20} />}
                        {toast.type === "error" && <AlertCircle size={20} />}
                        {toast.type === "info" && <Info size={20} />}
                    </div>

                    <p className="text-sm font-bold tracking-tight">
                        {toast.message}
                    </p>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={14} />
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full rounded-b-[1.5rem] overflow-hidden">
                        <div className="h-full bg-white/60 animate-toast-progress" style={{ animationDuration: '3000ms' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
