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
            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 active:scale-95"
            title="Terminate Consumer Identity"
        >
            <Trash2 size={18} strokeWidth={2.5} />
        </button>
    );
}
