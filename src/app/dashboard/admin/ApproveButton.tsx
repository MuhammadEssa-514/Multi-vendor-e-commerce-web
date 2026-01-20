"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveButton({ sellerId }: { sellerId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleApprove = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approve-seller", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to approve");
            }
        } catch (error) {
            console.error(error);
            alert("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
            <Check size={16} /> {loading ? "Approving..." : "Approve"}
        </button>
    );
}
