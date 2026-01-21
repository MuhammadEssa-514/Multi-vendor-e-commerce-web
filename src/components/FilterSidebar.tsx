"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";

const CATEGORIES = [
    "All",
    "Electronics",
    "Mobiles & Tablets",
    "Fashion",
    "Home & Living",
    "Beauty & Health",
    "Toys & Hobbies",
    "Sports & Outdoors",
    "Automotive",
    "Tools & Industrial",
    "Books & Stationery"
];

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile drawer when route changes or filters logic applies
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname, searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (category && category !== "All") params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sort) params.set("sort", sort);

        const search = searchParams.get("search");
        if (search) params.set("search", search);

        router.push(`${pathname}?${params.toString()}`);
        setIsMobileOpen(false);
    };

    const SidebarContent = () => (
        <>
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Filters</h3>
                <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-500 hover:text-red-500 transition">
                    <X size={20} />
                </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Category</h4>
                <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                checked={category === cat}
                                onChange={() => setCategory(cat)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className={`text-sm ${category === cat ? "text-blue-600 font-medium" : "text-gray-600 group-hover:text-blue-500 transition"}`}>
                                {cat}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Price Range (₨)</h4>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full text-sm border-gray-200 rounded-sm px-2 py-1.5 focus:border-blue-500 focus:ring-0 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full text-sm border-gray-200 rounded-sm px-2 py-1.5 focus:border-blue-500 focus:ring-0 outline-none"
                    />
                </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Sort By</h4>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-sm px-2 py-1.5 focus:border-blue-500 focus:ring-0 outline-none text-black bg-white"
                >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="trending">Trending Now</option>
                </select>
            </div>

            <button
                onClick={applyFilters}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-sm text-sm hover:bg-blue-700 transition shadow-sm active:scale-95"
            >
                Apply Filters
            </button>

            {(category !== "All" || minPrice || maxPrice || sort !== "newest") && (
                <button
                    onClick={() => {
                        setCategory("All");
                        setMinPrice("");
                        setMaxPrice("");
                        setSort("newest");
                        router.push(pathname);
                    }}
                    className="w-full mt-2 text-blue-600 text-xs font-semibold hover:underline"
                >
                    Clear All
                </button>
            )}
        </>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden w-full mb-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-blue-100 py-3 rounded-lg shadow-sm text-blue-700 font-bold hover:bg-blue-50 transition"
                >
                    <Filter size={18} />
                    Show Filters
                </button>
            </div>

            {/* Desktop Sidebar (Always Visible) */}
            <div className="hidden lg:block w-64 flex-shrink-0 bg-white p-5 rounded-md border border-gray-200 h-fit sticky top-[90px]">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[2000] lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />

                    {/* Drawer Content */}
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 shadow-2xl overflow-y-auto animate-slide-in-left">
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
}
