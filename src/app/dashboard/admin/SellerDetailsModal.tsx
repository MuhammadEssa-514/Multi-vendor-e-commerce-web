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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-500 border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/20">
                            {seller.user?.image ? (
                                <img src={seller.user.image} alt={seller.storeName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-black">{seller.storeName.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black tracking-tight">{seller.storeName}</h2>
                                {seller.user?.isVerified && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 rounded-full">
                                        <ShieldCheck size={10} /> Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-indigo-200">
                                <span className={`w-2 h-2 rounded-full ${seller.approved ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    {seller.approved ? 'Active Marketplace Partner' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Information Sections */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} /> Owner Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><User size={16} className="text-gray-400" /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Name</p>
                                            <p className="text-sm font-black text-gray-900">{seller.user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Mail size={16} className="text-gray-400" /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                                            <p className="text-sm font-black text-gray-900">{seller.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Calendar size={16} className="text-gray-400" /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Member Since</p>
                                            <p className="text-sm font-black text-gray-900">{new Date(seller.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Grid */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart3 size={14} /> Business Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                                    <ShoppingBag size={20} className="text-emerald-600 mb-2" />
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Inventory</p>
                                    <p className="text-xl font-black text-gray-900">{seller.productCount}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
                                    <Wallet size={20} className="text-blue-600 mb-2" />
                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Balance</p>
                                    <p className="text-xl font-black text-gray-900">${seller.balance.toLocaleString()}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-3xl col-span-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Lifetime Earnings</p>
                                            <p className="text-2xl font-black text-gray-900">${seller.totalEarnings.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Commission Paid</p>
                                            <p className="text-lg font-black text-indigo-600">${(seller.commissionPaid || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                        >
                            Close Overview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
