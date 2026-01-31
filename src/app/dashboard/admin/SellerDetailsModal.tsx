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
            {/* Dark minimal backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Premium Container */}
            <div className="relative bg-white w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl sm:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 mx-4 [&::-webkit-scrollbar]:hidden scrollbar-none">
                {/* Header */}
                <div className="p-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100 flex-shrink-0 shadow-sm">
                            {seller.storeName?.charAt(0) || "S"}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-gray-900 truncate tracking-tight uppercase max-w-[150px] sm:max-w-none">{seller.storeName}</h2>
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">Merchant Dossier</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-gray-100"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Information Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Legal Representative</p>
                            <p className="text-xs font-black text-gray-900 tracking-tight">{seller.name || "N/A"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 leading-none">
                                <ShieldCheck size={10} className="w-3 h-3 text-amber-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Identity Check</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 tracking-tight">{seller.cnic || "Pending Input"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 leading-none">
                                <Phone size={10} className="w-3 h-3 text-indigo-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Primary Contact</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 tracking-tight">{seller.phoneNumber || "Not Set"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 leading-none">
                                <Globe size={10} className="w-3 h-3 text-emerald-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Territory</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 tracking-tight">
                                {seller.city || "Global"}, {seller.country || "Intl"}
                            </p>
                        </div>
                        <div className="space-y-0.5 sm:col-span-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Electronic Mail</p>
                            <p className="text-xs font-black text-gray-900 lowercase tracking-tight break-all">{seller.email || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Onboarding Status</p>
                            <div>
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${seller.approved ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
                                    {seller.approved ? 'Verified Active' : 'Security Vetting'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center group hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                            <div className="flex sm:block items-center justify-between">
                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest sm:mb-1 leading-none">Inventory</p>
                                <p className="text-base font-black text-gray-900 tracking-tighter">{seller.productCount}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center group hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                            <div className="flex sm:block items-center justify-between">
                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest sm:mb-1 leading-none">Settlement</p>
                                <p className="text-base font-black text-emerald-600 tracking-tighter">₨{seller.balance?.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center group hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                            <div className="flex sm:block items-center justify-between">
                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest sm:mb-1 leading-none">Throughput</p>
                                <p className="text-base font-black text-blue-600 tracking-tighter">₨{seller.totalEarnings?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer System Integrity */}
                    <div className="pt-6 sm:pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                                Commissioned {new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
