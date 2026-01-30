"use client";

import { X, Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading = false
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Minimal Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Compact Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[340px] animate-in zoom-in-95 fade-in duration-200 border border-gray-100 p-5">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                        <Trash2 className="text-red-500" size={24} />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-2 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 py-2 text-white bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                "Delete Now"
                            )}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 text-gray-300 hover:text-gray-400 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
