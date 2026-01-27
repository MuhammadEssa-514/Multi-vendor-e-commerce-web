"use client";

import { useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import ApproveButton from "./ApproveButton";
import DeleteSellerButton from "./DeleteSellerButton";
import SellerDetailsModal from "./SellerDetailsModal";

export default function SellerTableRow({ seller, deleteSellerAction }: { seller: any, deleteSellerAction: (id: string) => Promise<void> }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <tr className="hover:bg-[#F8FAFC] transition-all duration-300 group">
            <td className="px-8 py-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500 border border-indigo-100/50">
                            {seller.user?.image ? (
                                <img src={seller.user.image} alt={seller.storeName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 font-black">{seller.storeName.charAt(0)}</span>
                            )}
                        </div>
                        {seller.approved && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                {seller.storeName}
                            </p>
                            {seller.user?.isVerified && (
                                <div className="bg-indigo-100 text-indigo-600 p-0.5 rounded-full shadow-sm" title="Email Verified">
                                    <ShieldCheck size={10} />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1 flex items-center gap-1.5 line-clamp-1">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" /> {seller.user?.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900">{seller.productCount}</span>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest whitespace-nowrap">Inventory</span>
                    </div>
                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min((seller.productCount / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-xs font-black text-emerald-600 leading-none">${seller.totalEarnings.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em] mt-1">Total Earned</p>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-100" />
                    <div>
                        <p className="text-xs font-black text-indigo-600 leading-none">${seller.balance.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em] mt-1">Available</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => setIsDetailsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <Eye size={14} /> Profile
                    </button>

                    <ApproveButton
                        sellerId={seller._id}
                        storeName={seller.storeName}
                        isApproved={seller.approved}
                    />

                    <DeleteSellerButton
                        sellerId={seller._id}
                        storeName={seller.storeName}
                        onDelete={deleteSellerAction}
                    />
                </div>

                <SellerDetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    seller={seller}
                />
            </td>
        </tr>
    );
}
