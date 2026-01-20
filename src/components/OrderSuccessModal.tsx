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
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header Decoration */}
                <div className="bg-emerald-500 p-10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl"></div>

                    <div className="bg-white rounded-3xl p-5 shadow-xl shadow-emerald-600/20 relative z-10">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-10 text-center">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 font-medium mb-8">
                        Thank you for your purchase. We've received your order and are preparing it for shipment.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex items-center justify-between">
                        <div className="text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Paid</span>
                            <span className="text-lg font-black text-gray-900">₨ {orderTotal.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Package size={20} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onViewOrders}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                        >
                            View Order Tracking <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-white text-gray-600 font-bold py-4 rounded-2xl border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            <ShoppingBag size={18} /> Continue Shopping
                        </button>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="px-10 pb-10">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                        <p className="text-[11px] text-blue-600 font-semibold leading-relaxed text-left">
                            An order confirmation has been sent to your email with the full details of your purchase.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
