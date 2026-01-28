"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import SellerDetailsModal from "./SellerDetailsModal";

interface ViewSellerButtonProps {
    seller: any;
}

export default function ViewSellerButton({ seller }: ViewSellerButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                title="View Details"
            >
                <Eye size={18} />
            </button>

            {isOpen && (
                <SellerDetailsModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    seller={seller}
                />
            )}
        </>
    );
}
