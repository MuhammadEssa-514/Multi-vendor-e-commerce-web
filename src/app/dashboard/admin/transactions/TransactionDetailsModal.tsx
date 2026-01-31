"use client";

import { X, Receipt, CheckCircle, Clock, AlertCircle, Building2, User, CreditCard, Tag } from "lucide-react";

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any; // Order object + extra details
}

export default function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
    if (!isOpen || !transaction) return null;

    // Derived Financials (Assuming 10% Platform Fee for demo/UI if not explicitly stored)
    const totalAmount = transaction.total || 0;
    const platformFeeRate = 0.10;
    const platformFee = Math.round(totalAmount * platformFeeRate);
    const sellerNet = totalAmount - platformFee;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Receipt Modal */}
            <div className="relative bg-white w-full max-w-[380px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 mx-4">

                {/* 1. Header Section (Brand + Close) */}
                <div className="bg-gray-900 p-6 flex items-start justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />

                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                            <Receipt className="text-white" size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Transaction</h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Ref: #{transaction._id ? transaction._id.slice(-8) : "N/A"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative z-10 p-2 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white rounded-xl transition-all"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 2. Amount Display */}
                <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/50 text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Total Settled</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                        ₨ {totalAmount.toLocaleString()}
                    </h1>
                    <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${transaction.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            transaction.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                        }`}>
                        {transaction.status === 'delivered' && <CheckCircle size={12} strokeWidth={3} />}
                        {transaction.status === 'pending' && <Clock size={12} strokeWidth={3} />}
                        {transaction.status === 'cancelled' && <AlertCircle size={12} strokeWidth={3} />}
                        {transaction.status}
                    </div>
                </div>

                {/* 3. Ledger Breakdown (The "Receipt" part) */}
                <div className="p-6 space-y-6">
                    {/* Parties involved */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                <User size={14} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase">Payer</p>
                                <p className="text-xs font-bold text-gray-900 truncate max-w-[80px]">
                                    {transaction.userId?.name?.split(" ")[0] || "Guest"}
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="flex items-center gap-3 text-right">
                            <div className="flex flex-col items-end">
                                <p className="text-[9px] font-black text-gray-400 uppercase">Payee</p>
                                <p className="text-xs font-bold text-gray-900 truncate max-w-[80px]">
                                    {transaction.sellerName || "Store"}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-500">
                                <Building2 size={14} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Financial Split */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Funds Allocation</p>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="font-bold text-gray-900">₨ {totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5">
                                <Tag size={12} className="text-blue-500" /> Platform Fee (10%)
                            </span>
                            <span className="font-bold text-rose-500">- ₨ {platformFee.toLocaleString()}</span>
                        </div>
                        <div className="w-full border-t border-gray-100 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-gray-900 uppercase">Net Payout</span>
                            <span className="text-base font-black text-emerald-600">₨ {sellerNet.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                <CreditCard size={14} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase">Payment Method</p>
                                <p className="text-xs font-bold text-gray-900">Cash on Delivery</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                <Clock size={14} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase">Timestamp</p>
                                <p className="text-xs font-bold text-gray-900">{new Date(transaction.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all mt-4 shadow-lg shadow-gray-900/10 active:scale-95"
                    >
                        Close Receipt
                    </button>
                </div>

                {/* Decorative jagged edge (CSS trick or SVG) - kept simple for now with padding */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-50" />
            </div>
        </div>
    );
}
