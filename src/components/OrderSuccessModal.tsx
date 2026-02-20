"use client";

import React from "react";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewOrders: () => void;
    orderTotal: number;
}

export default function OrderSuccessModal({ isOpen, onClose, onViewOrders, orderTotal }: OrderSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-[90%] sm:max-w-sm overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header Decoration */}
                <div className="bg-emerald-500 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-emerald-600/20 rounded-full blur-2xl"></div>

                    <div className="bg-white rounded-full p-4 shadow-xl shadow-emerald-600/20 relative z-10">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 text-center">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Order(s) Confirmed!</h2>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                        Your orders have been successfully placed.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-3 mb-6 border border-gray-100 flex items-center justify-between">
                        <div className="text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Paid</span>
                            <span className="text-base font-black text-gray-900">₨ {orderTotal.toLocaleString()}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Package size={16} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onViewOrders}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200 text-sm"
                        >
                            Track Order <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] text-sm"
                        >
                            <ShoppingBag size={16} /> Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
