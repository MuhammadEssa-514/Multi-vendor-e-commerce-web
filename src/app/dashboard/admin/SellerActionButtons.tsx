"use client";

import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { useSellerActions } from "./SellerActionsManager";

interface SellerActionButtonsProps {
    seller: any;
}

export default function SellerActionButtons({
    seller
}: SellerActionButtonsProps) {
    const { openModal } = useSellerActions();

    return (
        <div className="flex items-center justify-end gap-1">
            {/* Status Toggle Button */}
            <button
                onClick={() => openModal("approve", seller)}
                className={`p-2 rounded-lg transition-colors ${seller.approved
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-emerald-500 hover:bg-emerald-50'
                    }`}
                title={seller.approved ? "Suspend" : "Approve"}
            >
                {seller.approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
            </button>

            {/* Delete Button */}
            <button
                onClick={() => openModal("delete", seller)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Seller"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
