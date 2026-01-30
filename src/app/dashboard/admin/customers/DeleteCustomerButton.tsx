"use client";

import { Trash2 } from "lucide-react";
import { useCustomerActions } from "./CustomerActionsManager";

interface DeleteCustomerButtonProps {
    customer: any;
}

export default function DeleteCustomerButton({ customer }: DeleteCustomerButtonProps) {
    const { openModal } = useCustomerActions();

    return (
        <button
            onClick={() => openModal("delete", customer)}
            className="p-2 text-white bg-red-500 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors"
            title="Delete Account"
        >
            <Trash2 size={18} />
        </button>
    );
}
