"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function DeleteSellerButton({
    sellerId,
    storeName,
    onDelete
}: {
    sellerId: string,
    storeName: string,
    onDelete: (id: string) => Promise<void>
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onDelete(sellerId);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete seller profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Seller"
            >
                <Trash2 size={18} />
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Seller Account?"
                message={`Are you sure you want to delete "${storeName}"? This action is permanent and will remove their user account, store profile, and all listed products.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={loading}
            />
        </>
    );
}
