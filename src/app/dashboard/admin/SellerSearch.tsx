"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SellerSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            router.push(`/dashboard/admin/sellers?${params.toString()}`);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, router, searchParams]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a seller..."
                className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} strokeWidth={2.5} />
            </div>
        </div>
    );
}
