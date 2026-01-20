"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListFilter, Clock, Truck, CheckCircle2 } from "lucide-react";

interface OrderTabsProps {
    counts: {
        all: number;
        pending: number;
        shipped: number;
        delivered: number;
    };
}

export default function OrderTabs({ counts }: OrderTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "all";

    const tabs = [
        { id: "all", label: "All Orders", icon: ListFilter, count: counts.all },
        { id: "pending", label: "Pending", icon: Clock, count: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "shipped", label: "Shipped", icon: Truck, count: counts.shipped, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "delivered", label: "Delivered", icon: CheckCircle2, count: counts.delivered, color: "text-green-600", bg: "bg-green-50" },
    ];

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tabId === "all") {
            params.delete("tab");
        } else {
            params.set("tab", tabId);
        }
        // Preserve search query if it exists
        const q = searchParams.get("q");
        if (q) {
            params.set("q", q);
        }
        router.push(`/dashboard/seller/orders?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
            {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${isActive
                            ? "bg-gray-900 text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <Icon size={18} className={isActive ? "text-white" : tab.color || "text-gray-400"} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter shadow-sm ${isActive
                                ? "bg-white/20 text-white"
                                : `${tab.bg || "bg-gray-100"} ${tab.color || "text-gray-600"}`
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
