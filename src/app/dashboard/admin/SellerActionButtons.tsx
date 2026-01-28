"use client";

import { useState, useTransition } from "react";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface SellerActionButtonsProps {
    sellerId: string;
    isApproved: boolean;
    storeName: string;
    toggleApproval: (formData: FormData) => Promise<void>;
    handleDelete: (formData: FormData) => Promise<void>;
}

export default function SellerActionButtons({
    sellerId,
    isApproved,
    storeName,
    toggleApproval,
    handleDelete
}: SellerActionButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const onStatusToggle = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("sellerId", sellerId);
            await toggleApproval(formData);
            setShowStatusModal(false);
        });
    };

    const onDelete = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("sellerId", sellerId);
            await handleDelete(formData);
            setShowDeleteModal(false);
        });
    };

    return (
        <div className="flex items-center justify-end gap-1">
            {/* Status Toggle Button */}
            <button
                onClick={() => setShowStatusModal(true)}
                className={`p-2 rounded-lg transition-colors ${isApproved
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-emerald-500 hover:bg-emerald-50'
                    }`}
                title={isApproved ? "Suspend" : "Approve"}
            >
                {isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
            </button>

            {/* Delete Button */}
            <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Seller"
            >
                <Trash2 size={18} />
            </button>

            {/* Status Confirmation Modal */}
            <ConfirmationModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                onConfirm={onStatusToggle}
                isLoading={isPending}
                title={isApproved ? "Suspend Seller" : "Approve Seller"}
                message={`Are you sure you want to ${isApproved ? "suspend" : "approve"} ${storeName}?`}
                confirmText={isApproved ? "Suspend" : "Approve"}
                type={isApproved ? "danger" : "success"}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={onDelete}
                isLoading={isPending}
                title="Delete Merchant"
                message={`This will permanently remove ${storeName} and all its products. This action cannot be undone.`}
                confirmText="Delete Now"
                type="danger"
            />
        </div>
    );
}
