"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Rocket, ShieldCheck, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerWelcomePopup({ storeName, onDismiss }: { storeName: string, onDismiss: () => void }) {
    const [show, setShow] = useState(true);
    const router = useRouter();

    if (!show) return null;

    const handleClose = () => {
        setShow(false);
        onDismiss();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-700 border border-white/20">
                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -transe-y-1/2 translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 -transe-y-1/2 -transe-x-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />

                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
                    >
                        <X size={14} />
                    </button>

                    <div className="relative z-10 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
                        </div>
                        <h2 className="text-lg sm:text-2xl font-black tracking-tight mb-0.5">Shop Confirmed!</h2>
                        <p className="text-blue-100 text-[10px] sm:text-xs font-medium italic opacity-90">Your journey starts now</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-8">
                    <div className="mb-4 sm:mb-6 text-center">
                        <p className="text-gray-600 font-medium text-[11px] sm:text-xs leading-relaxed">
                            Welcome <span className="text-gray-900 font-bold">"{storeName}"</span>! Your store is now active.
                            We've prepared everything for your success.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                                <Sparkles size={14} />
                            </div>
                            <div>
                                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-tighter">Live Inventory</h4>
                                <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium leading-tight">Your products are now visible worldwide.</p>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 flex-shrink-0">
                                <ShieldCheck size={14} />
                            </div>
                            <div>
                                <h4 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-tighter">Verified Badge</h4>
                                <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium leading-tight">Trust indicators added to your profile.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        Launch Dashboard
                    </button>

                    <p className="text-center text-[8px] text-gray-400 mt-5 font-bold uppercase tracking-tighter opacity-70">
                        SellerPro Engine v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
