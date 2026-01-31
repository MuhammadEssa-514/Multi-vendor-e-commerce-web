"use client";

import { useState, useTransition, createContext, useContext, ReactNode } from "react";
import CustomerDetailsModal from "./CustomerDetailsModal";
import ConfirmationModal from "@/components/ConfirmationModal";

type ModalType = "view" | "delete" | null;

interface CustomerActionsContextType {
    openModal: (type: ModalType, customer: any) => void;
}

const CustomerActionsContext = createContext<CustomerActionsContextType | undefined>(undefined);

export function useCustomerActions() {
    const context = useContext(CustomerActionsContext);
    if (!context) throw new Error("useCustomerActions must be used within CustomerActionsManager");
    return context;
}

interface CustomerActionsManagerProps {
    children: ReactNode;
    deleteCustomerAction: (formData: FormData) => Promise<void>;
}

export default function CustomerActionsManager({
    children,
    deleteCustomerAction
}: CustomerActionsManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const openModal = (type: ModalType, customer: any) => {
        setSelectedCustomer(customer);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleDelete = () => {
        if (!selectedCustomer) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("userId", selectedCustomer._id);
            await deleteCustomerAction(formData);
            closeModal();
        });
    };

    return (
        <CustomerActionsContext.Provider value={{ openModal }}>
            {children}

            {activeModal === "view" && (
                <CustomerDetailsModal
                    isOpen={true}
                    onClose={closeModal}
                    customer={selectedCustomer}
                />
            )}

            <ConfirmationModal
                isOpen={activeModal === "delete"}
                onClose={closeModal}
                onConfirm={handleDelete}
                isLoading={isPending}
                title="Delete Customer"
                message={`Are you sure you want to permanently remove ${selectedCustomer?.name}? This action cannot be undone.`}
                confirmText="Terminate Now"
                type="danger"
            />
        </CustomerActionsContext.Provider>
    );
}
