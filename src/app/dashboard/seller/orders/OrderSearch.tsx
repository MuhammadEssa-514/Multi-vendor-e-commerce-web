"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function OrderSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const debouncedQuery = useDebounce(query, 500);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    useEffect(() => {
        const queryString = createQueryString("q", debouncedQuery);
        router.push(`/dashboard/seller/orders?${queryString}`);
    }, [debouncedQuery, router, createQueryString]);

    return (
        <div className="relative w-full max-w-md mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
            </div>
            <input
                type="text"
                placeholder="Search by ID, Name, Product, or Tracking #..."
                className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
