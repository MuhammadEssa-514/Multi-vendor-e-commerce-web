"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({
    isApproved,
    onClick,
    sellerId,
    storeName
}: {
    isApproved: boolean,
    onClick?: () => void,
    sellerId?: string,
    storeName?: string
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleInternalClick = async (e: React.MouseEvent) => {
        if (onClick) {
            onClick();
            return;
        }

        if (!sellerId) return;

        const action = isApproved ? "suspend" : "approve";
        if (!confirm(`Are you sure you want to ${action} ${storeName || "this seller"}?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/approve-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                router.refresh();
            } else {
                alert(`Error: ${data.error || "Failed to update status"}`);
            }
        } catch (err) {
            alert("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleInternalClick}
            disabled={loading}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-black text-[10px] border tracking-wide uppercase ${isApproved
                ? "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isApproved ? (
                <>Suspend</>
            ) : (
                <>
                    <Check size={14} /> Approve
                </>
            )}
        </button>
    );
}
