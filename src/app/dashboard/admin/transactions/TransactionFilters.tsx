"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function TransactionFilters({ query, status }: { query: string, status: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }

    function handleStatusChange(statusValue: string) {
        const params = new URLSearchParams(searchParams);
        if (statusValue && statusValue !== "all") {
            params.set("status", statusValue);
        } else {
            params.delete("status");
        }
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className={`relative group/search w-full transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within/search:text-white transition-colors" size={18} />
                <input
                    type="text"
                    defaultValue={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Order ID, Store, Customer..."
                    className="w-full md:w-[280px] pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none transition-all"
                />
            </div>

            <div className={`w-full sm:w-auto transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
                <select
                    defaultValue={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full sm:w-[140px] px-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none"
                >
                    <option value="all" className="text-gray-900 font-bold">All Status</option>
                    <option value="pending" className="text-gray-900 font-bold">Pending</option>
                    <option value="processing" className="text-gray-900 font-bold">Processing</option>
                    <option value="shipped" className="text-gray-900 font-bold">Shipped</option>
                    <option value="delivered" className="text-gray-900 font-bold">Delivered</option>
                    <option value="cancelled" className="text-gray-900 font-bold">Cancelled</option>
                </select>
            </div>
        </div>
    );
}
