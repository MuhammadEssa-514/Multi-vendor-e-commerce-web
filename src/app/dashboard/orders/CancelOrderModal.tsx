"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";

interface CancelOrderModalProps {
    orderId: string;
    orderNumber: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CANCELLATION_REASONS = [
    "Changed my mind",
    "Found better price",
    "Ordered by mistake",
    "Delivery time too long",
    "Other",
];

export default function CancelOrderModal({
    orderId,
    orderNumber,
    isOpen,
    onClose,
    onSuccess,
}: CancelOrderModalProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleCancel = async () => {
        const reason = selectedReason === "Other" ? otherReason : selectedReason;

        if (!reason.trim()) {
            setError("Please select a reason");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/orders/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, reason }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to cancel order");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-3.5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-white">Cancel Order</h3>
                        <p className="text-red-50 text-xs font-bold">#{orderNumber}</p>
                    </div>
                    <XCircle className="text-white/80" size={20} />
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                    {/* Reason Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-2">
                            Why are you cancelling?
                        </label>
                        <select
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm font-medium bg-white"
                        >
                            <option value="">Select a reason...</option>
                            {CANCELLATION_REASONS.map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Other Reason Input */}
                    {selectedReason === "Other" && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="Please specify your reason..."
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none text-sm font-medium"
                                rows={2}
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs font-bold text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Keep
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            "Cancel Order"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
