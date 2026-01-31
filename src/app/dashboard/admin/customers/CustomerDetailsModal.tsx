"use client";

import { X, User, Mail, Calendar, Phone, Globe, ShoppingCart, CreditCard, Package, DollarSign } from "lucide-react";
import Image from "next/image";

interface CustomerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export default function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
    if (!isOpen || !customer) return null;

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
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-100 flex-shrink-0 shadow-sm overflow-hidden relative">
                            {customer.image ? (
                                <Image src={customer.image} alt={customer.name} fill className="object-cover" />
                            ) : (
                                customer.name?.charAt(0) || "U"
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-gray-900 truncate tracking-tight max-w-[150px] sm:max-w-none">{customer.name}</h2>
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">Consumer Profile</p>
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
                    {/* Primary Details Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5 sm:col-span-2">
                            <div className="flex items-center gap-1.5">
                                <Mail size={10} className="w-3 h-3 text-blue-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Email Address</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 lowercase tracking-tight break-all">{customer.email}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <Phone size={10} className="w-3 h-3 text-emerald-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Mobile</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 tracking-tight">{customer.phoneNumber || "Not Set"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <Globe size={10} className="w-3 h-3 text-indigo-500" />
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Location</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 tracking-tight">
                                {customer.city || "Global"}, {customer.country || "Intl"}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                                <Package size={16} className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Orders</p>
                                <p className="text-sm font-black text-gray-900">{customer.orderCount || 0}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                                <DollarSign size={16} className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Spent</p>
                                <p className="text-sm font-black text-emerald-600">₨{customer.totalSpent?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600">
                                <ShoppingCart size={16} className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Wishlist</p>
                                <p className="text-sm font-black text-gray-900">{customer.wishlist?.length || 0}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                                <CreditCard size={16} className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Status</p>
                                <p className={`text-xs font-black uppercase ${customer.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {customer.isEmailVerified ? "Verified" : "Pending"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 sm:pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                                Joined {new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
