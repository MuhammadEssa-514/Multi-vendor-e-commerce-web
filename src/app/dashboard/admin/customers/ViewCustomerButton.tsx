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
            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-95"
            title="View Individual Profile"
        >
            <Eye size={18} strokeWidth={2.5} />
        </button>
    );
}
