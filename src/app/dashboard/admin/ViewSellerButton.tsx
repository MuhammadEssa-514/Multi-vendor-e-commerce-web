"use client";

import { Eye } from "lucide-react";
import { useSellerActions } from "./SellerActionsManager";

interface ViewSellerButtonProps {
    seller: any;
}

export default function ViewSellerButton({ seller }: ViewSellerButtonProps) {
    const { openModal } = useSellerActions();

    return (
        <button
            onClick={() => openModal("view", seller)}
            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
        >
            <Eye size={18} />
        </button>
    );
}
