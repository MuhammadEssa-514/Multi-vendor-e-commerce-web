"use client";

import { X, Store, User, Mail, Calendar, BarChart3, Wallet, ShoppingBag, ShieldCheck, Phone, Globe } from "lucide-react";

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
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-blue-500 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 flex-shrink-0">
                            {seller.storeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white truncate">{seller.storeName}</h2>
                            <p className="text-[10px] text-white font-medium uppercase tracking-wider">Merchant Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:text-white hover:bg-red-600 bg-white text-blue-500 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-6">
                    {/* Info Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Owner Name</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{seller.userId?.name || "N/A"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <ShieldCheck size={10} className="text-orange-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">CNIC Identity</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 truncate">{seller.cnic || "Not Provided"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Phone size={10} className="text-emerald-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 truncate">{seller.phoneNumber || "Not Provided"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Globe size={10} className="text-blue-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Geography</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 truncate">
                                {seller.city || "N/A"}, {seller.country || "N/A"}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Corporate Email</p>
                            <p className="text-xs font-bold text-gray-900 truncate lowercase">{seller.userId?.email || "N/A"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Verification Status</p>
                            <div>
                                <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${seller.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                    {seller.approved ? 'Verified Merchant' : 'Verification Pending'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-0.5 col-span-full">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Merchant Since</p>
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-gray-400" />
                                <p className="text-xs font-bold text-gray-900">{new Date(seller.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Tiles */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Stock</p>
                            <p className="text-xs font-bold text-gray-900">{seller.productCount}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Balance</p>
                            <p className="text-xs font-bold text-gray-900">₨{seller.balance.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Total</p>
                            <p className="text-xs font-bold text-gray-900">₨{seller.totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Simple Action */}
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2 bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all"
                        >
                            Close Overview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
