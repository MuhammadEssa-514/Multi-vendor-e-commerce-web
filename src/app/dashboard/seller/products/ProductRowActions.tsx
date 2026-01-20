"use client";

import { useState } from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface ProductRowActionsProps {
    productId: string;
}

export default function ProductRowActions({ productId }: ProductRowActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Delete failed");
            }

            showToast("Product deleted successfully", "success");
            router.refresh();
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex justify-end gap-2 text-gray-400">
            <Link
                href={`/dashboard/seller/products/edit/${productId}`}
                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            >
                <Edit2 size={16} />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
            >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
        </div>
    );
}
