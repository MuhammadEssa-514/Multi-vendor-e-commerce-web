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
            bg: "bg-red-50",
            icon: "text-red-600",
            button: "bg-red-600 hover:bg-red-700 shadow-red-200",
            border: "border-red-100"
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
                className="absolute inset-0 bg-gray-900/40 animate-in fade-in duration-150"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[320px] overflow-hidden animate-in fade-in duration-150 border border-gray-100">
                <div className="p-6">
                    {/* Header Icon */}
                    <div className={`w-12 h-12 ${currentColors.bg} rounded-xl flex items-center justify-center mb-4`}>
                        {type === "danger" && <AlertTriangle className={currentColors.icon} size={22} />}
                        {type === "success" && <CheckCircle className={currentColors.icon} size={22} />}
                        {type === "info" && <Info className={currentColors.icon} size={22} />}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`w-full py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:opacity-50 ${currentColors.button}`}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
