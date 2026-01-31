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
            className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100/50 active:scale-90"
            title="View Merchant Profile"
        >
            <Eye size={18} strokeWidth={2.5} />
        </button>
    );
}
