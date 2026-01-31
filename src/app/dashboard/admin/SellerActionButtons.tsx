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
        <div className="flex items-center justify-end gap-2">
            {/* Status Toggle Button */}
            <button
                onClick={() => openModal("approve", seller)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border active:scale-90 ${seller.approved
                    ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                    }`}
                title={seller.approved ? "Suspend Merchant" : "Approve Merchant"}
            >
                {seller.approved ? <XCircle size={18} strokeWidth={2.5} /> : <CheckCircle size={18} strokeWidth={2.5} />}
            </button>

            {/* Delete Button */}
            <button
                onClick={() => openModal("delete", seller)}
                className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 active:scale-90"
                title="Purge Merchant Record"
            >
                <Trash2 size={18} strokeWidth={2.5} />
            </button>
        </div>
    );
}
