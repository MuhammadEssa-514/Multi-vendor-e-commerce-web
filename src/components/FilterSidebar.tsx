"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Electronic", "Fashion", "Home", "Beauty", "Toys", "Sports", "Motors", "Tools"];

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const pathname = usePathname();

    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (category && category !== "All") params.set("category", category);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sort) params.set("sort", sort);

        const search = searchParams.get("search");
        if (search) params.set("search", search);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full lg:w-64 flex-shrink-0 bg-white p-4 rounded-sm shadow-sm h-fit sticky top-[80px]">
            <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider border-b pb-2">Filters</h3>

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
                    className="w-full text-sm border-gray-200 rounded-sm px-2 py-1.5 focus:border-blue-500 focus:ring-0 outline-none bg-white"
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
        </div>
    );
}
