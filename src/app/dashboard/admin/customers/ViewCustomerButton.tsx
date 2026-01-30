"use client";

import { Eye } from "lucide-react";
import { useCustomerActions } from "./CustomerActionsManager";

interface ViewCustomerButtonProps {
    customer: any;
}

export default function ViewCustomerButton({ customer }: ViewCustomerButtonProps) {
    const { openModal } = useCustomerActions();

    return (
        <button
            onClick={() => openModal("view", customer)}
            className="p-2 bg-blue-500 text-white hover:bg-gray-100 hover:text-blue-500 rounded-lg transition-colors"
            title="View Profile"
        >
            <Eye size={18} />
        </button>
    );
}
