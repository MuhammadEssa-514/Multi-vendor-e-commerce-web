"use client";

import { Trash2 } from "lucide-react";

export default function DeleteSellerButton({
    onClick
}: {
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Seller"
        >
            <Trash2 size={18} />
        </button>
    );
}
