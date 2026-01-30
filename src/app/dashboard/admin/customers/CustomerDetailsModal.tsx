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
            <div
                className="absolute inset-0 bg-gray-900/40 animate-in fade-in duration-150"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl animate-in fade-in duration-150 border border-gray-100 mx-4">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-blue-500 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 flex-shrink-0 overflow-hidden relative">
                            {customer.image ? (
                                <Image src={customer.image} alt={customer.name} fill className="object-cover" />
                            ) : (
                                customer.name?.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white truncate">{customer.name}</h2>
                            <p className="text-[10px] text-white font-medium uppercase tracking-wider">Customer Profile</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-blue-500 bg-white hover:bg-red-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-6">
                    {/* Primary Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Mail size={10} className="text-blue-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                            </div>
                            <p className="text-xs font-bold text-gray-900 truncate">{customer.email}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Phone size={10} className="text-emerald-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Primary Phone</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 truncate">{customer.phoneNumber || "Not Provided"}</p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Globe size={10} className="text-blue-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Geography</p>
                            </div>
                            <p className="text-xs font-black text-gray-900 truncate">
                                {customer.city || "N/A"}, {customer.country || "N/A"}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Calendar size={10} className="text-amber-500" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                            </div>
                            <p className="text-xs font-bold text-gray-900">{new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                        </div>
                    </div>

                    {/* Quick Stats Tile */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Account Summary</p>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Active Customer</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
                                    <Package size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Total Orders</span>
                                    <span className="text-sm font-black text-gray-900 leading-none">{customer.orderCount || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <DollarSign size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Total Spent</span>
                                    <span className="text-sm font-black text-gray-900 leading-none">₨{customer.totalSpent?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                    <ShoppingCart size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Wishlist</span>
                                    <span className="text-sm font-black text-gray-900 leading-none">{customer.wishlist?.length || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                    <CreditCard size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Status</span>
                                    <span className="text-[10px] font-black text-emerald-600 leading-none">{customer.isEmailVerified ? "Verified" : "Unverified"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2 bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
