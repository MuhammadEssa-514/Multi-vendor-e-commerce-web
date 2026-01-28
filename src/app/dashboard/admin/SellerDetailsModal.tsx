"use client";

import { X, Store, User, Mail, Calendar, BarChart3, Wallet, ShoppingBag, ShieldCheck } from "lucide-react";

interface SellerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    seller: any;
}

export default function SellerDetailsModal({ isOpen, onClose, seller }: SellerDetailsModalProps) {
    if (!isOpen || !seller) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Simple Light Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 animate-in fade-in duration-150"
                onClick={onClose}
            />

            {/* Simple Light Container */}
            <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl animate-in fade-in duration-150 border border-gray-100 mx-4">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 flex-shrink-0">
                            {seller.storeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 truncate">{seller.storeName}</h2>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Merchant Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-6">
                    {/* Info Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Owner</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{seller.user?.name}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Contact</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{seller.user?.email}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                            <div>
                                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${seller.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                    {seller.approved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Joined</p>
                            <p className="text-xs font-bold text-gray-900">{new Date(seller.createdAt).toISOString().split('T')[0]}</p>
                        </div>
                    </div>

                    {/* Stats Tiles */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Stock</p>
                            <p className="text-sm font-black text-gray-900">{seller.productCount}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Balance</p>
                            <p className="text-sm font-black text-gray-900">₨{seller.balance.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Total</p>
                            <p className="text-sm font-black text-gray-900">₨{seller.totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Simple Action */}
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Close Overview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
