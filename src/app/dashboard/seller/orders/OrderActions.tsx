
"use client";

import { useState, useEffect } from "react";
import { Truck, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderActionsProps {
    orderId: string;
    currentStatus: string;
    hasTracking?: boolean;
    initialTracking?: string;
    initialCourier?: string;
}

export default function OrderActions({
    orderId,
    currentStatus,
    hasTracking,
    initialTracking = "",
    initialCourier = ""
}: OrderActionsProps) {
    const [loading, setLoading] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(initialTracking);
    const [courier, setCourier] = useState(initialCourier);
    const [showTrackingInput, setShowTrackingInput] = useState(false);
    const router = useRouter();

    // Re-sync if props change (though unlikely to matter much here)
    useEffect(() => {
        setTrackingNumber(initialTracking);
        setCourier(initialCourier);
    }, [initialTracking, initialCourier]);

    const updateStatus = async (newStatus: string) => {
        // Validation for tracking info
        if (newStatus === "shipped" && (!trackingNumber.trim() || !courier.trim())) {
            alert("Please enter both a tracking number and a courier name.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    trackingNumber: newStatus === "shipped" ? trackingNumber.trim() : undefined,
                    courier: newStatus === "shipped" ? courier.trim() : undefined,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert("Success: Logistics Tracking Information Saved!");
                setShowTrackingInput(false);
                router.refresh(); // Refresh the server component data
            } else {
                throw new Error(data.error || "Update failed");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {loading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="animate-spin" size={16} /> Updating...
                </div>
            ) : (
                <>
                    {((currentStatus === 'pending') || (currentStatus === 'shipped' && !hasTracking)) && !showTrackingInput && (
                        <button
                            onClick={() => setShowTrackingInput(true)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors"
                        >
                            <Truck size={16} /> {currentStatus === 'shipped' ? 'Add Tracking' : 'Mark Shipped'}
                        </button>
                    )}

                    {showTrackingInput && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                            <input
                                type="text"
                                placeholder="Tracking #"
                                className="w-full text-xs p-2 border rounded"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Courier (e.g. TCS)"
                                className="w-full text-xs p-2 border rounded"
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateStatus('shipped')}
                                    className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                                >
                                    Confirm Ship
                                </button>
                                <button
                                    onClick={() => setShowTrackingInput(false)}
                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStatus === 'shipped' && (
                        <button
                            onClick={() => updateStatus('delivered')}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm transition-colors"
                        >
                            <CheckCircle size={16} /> Mark Delivered
                        </button>
                    )}
                    {currentStatus === 'delivered' && (
                        <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                            <CheckCircle size={16} /> Completed
                        </span>
                    )}
                </>
            )}
        </div>
    );
}
