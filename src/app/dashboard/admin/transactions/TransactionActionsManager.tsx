"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import TransactionDetailsModal from "./TransactionDetailsModal";

type ModalType = "view" | null;

interface TransactionActionsContextType {
    openModal: (type: ModalType, transaction: any) => void;
}

const TransactionActionsContext = createContext<TransactionActionsContextType | undefined>(undefined);

export function useTransactionActions() {
    const context = useContext(TransactionActionsContext);
    if (!context) throw new Error("useTransactionActions must be used within TransactionActionsManager");
    return context;
}

interface TransactionActionsManagerProps {
    children: ReactNode;
}

export default function TransactionActionsManager({
    children,
}: TransactionActionsManagerProps) {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const openModal = (type: ModalType, transaction: any) => {
        setSelectedTransaction(transaction);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    return (
        <TransactionActionsContext.Provider value={{ openModal }}>
            {children}

            {activeModal === "view" && (
                <TransactionDetailsModal
                    isOpen={true}
                    onClose={closeModal}
                    transaction={selectedTransaction}
                />
            )}
        </TransactionActionsContext.Provider>
    );
}
