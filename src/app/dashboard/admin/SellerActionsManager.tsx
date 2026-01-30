"use client";

import { useState, useTransition, createContext, useContext, ReactNode } from "react";
import SellerDetailsModal from "./SellerDetailsModal";
import ConfirmationModal from "@/components/ConfirmationModal";

type ModalType = "view" | "approve" | "delete" | null;

interface SellerActionsContextType {
    openModal: (type: ModalType, seller: any) => void;
}

const SellerActionsContext = createContext<SellerActionsContextType | undefined>(undefined);

export function useSellerActions() {
    const context = useContext(SellerActionsContext);
    if (!context) throw new Error("useSellerActions must be used within SellerActionsManager");
    return context;
}

interface SellerActionsManagerProps {
    children: ReactNode;
    toggleApprovalAction: (formData: FormData) => Promise<void>;
    handleDeleteAction: (formData: FormData) => Promise<void>;
}

export default function SellerActionsManager({
    children,
    toggleApprovalAction,
    handleDeleteAction
}: SellerActionsManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedSeller, setSelectedSeller] = useState<any>(null);

    const openModal = (type: ModalType, seller: any) => {
        setSelectedSeller(seller);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        // Don't clear selectedSeller immediately to avoid flicker during close animation
    };

    const handleToggleApproval = () => {
        if (!selectedSeller) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("sellerId", selectedSeller._id);
            await toggleApprovalAction(formData);
            closeModal();
        });
    };

    const handleDelete = () => {
        if (!selectedSeller) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("sellerId", selectedSeller._id);
            await handleDeleteAction(formData);
            closeModal();
        });
    };

    return (
        <SellerActionsContext.Provider value={{ openModal }}>
            {children}

            {/* Singleton Modals - Rendered only ONCE per page */}
            {activeModal === "view" && (
                <SellerDetailsModal
                    isOpen={true}
                    onClose={closeModal}
                    seller={selectedSeller}
                />
            )}

            <ConfirmationModal
                isOpen={activeModal === "approve"}
                onClose={closeModal}
                onConfirm={handleToggleApproval}
                isLoading={isPending}
                title={selectedSeller?.approved ? "Suspend Seller" : "Approve Seller"}
                message={`Are you sure you want to ${selectedSeller?.approved ? "suspend" : "approve"} ${selectedSeller?.storeName}?`}
                confirmText={selectedSeller?.approved ? "Suspend" : "Approve"}
                type={selectedSeller?.approved ? "danger" : "success"}
            />

            <ConfirmationModal
                isOpen={activeModal === "delete"}
                onClose={closeModal}
                onConfirm={handleDelete}
                isLoading={isPending}
                title="Delete Merchant"
                message={`This will permanently remove ${selectedSeller?.storeName} and all its products. This action cannot be undone.`}
                confirmText="Delete Now"
                type="danger"
            />
        </SellerActionsContext.Provider>
    );
}
