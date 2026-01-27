"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ApproveButton({ sellerId, storeName, isApproved }: { sellerId: string, storeName: string, isApproved: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log("ApproveButton Props:", { sellerId, storeName, isApproved });

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approve-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsModalOpen(false);
                router.refresh();
            } else {
                console.error("Status update error:", data.error);
                alert(`Failed: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs border ${isApproved
                        ? "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                        : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                    }`}
            >
                {isApproved ? <>Suspend</> : <><Check size={14} /> Approve</>}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleToggleStatus}
                title={isApproved ? "Suspend Seller?" : "Approve Seller?"}
                message={isApproved
                    ? `Are you sure you want to suspend "${storeName || 'this store'}"? They will lose dashboard access and their products will be hidden.`
                    : `Are you sure you want to approve "${storeName || 'this store'}"? This will allow them to list products and start selling.`}
                confirmText={isApproved ? "Yes, Suspend" : "Yes, Approve"}
                cancelText="Cancel"
                type={isApproved ? "danger" : "success"}
                isLoading={loading}
            />
        </>
    );
}
