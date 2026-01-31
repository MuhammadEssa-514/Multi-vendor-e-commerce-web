"use client";

import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "info";
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
    isLoading = false
}: ConfirmationModalProps) {
    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: "bg-rose-50",
            icon: "text-rose-600",
            button: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
            border: "border-rose-100"
        },
        success: {
            bg: "bg-emerald-50",
            icon: "text-emerald-600",
            button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
            border: "border-emerald-100"
        },
        info: {
            bg: "bg-blue-50",
            icon: "text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
            border: "border-blue-100"
        }
    };

    const currentColors = colors[type];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Header Icon */}
                    <div className={`w-16 h-16 ${currentColors.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                        {type === "danger" && <AlertTriangle className={currentColors.icon} size={28} strokeWidth={2.5} />}
                        {type === "success" && <CheckCircle className={currentColors.icon} size={28} strokeWidth={2.5} />}
                        {type === "info" && <Info className={currentColors.icon} size={28} strokeWidth={2.5} />}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`w-full py-4 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 ${currentColors.button}`}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-gray-400 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
