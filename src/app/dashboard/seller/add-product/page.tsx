"use client";

import { Sparkles } from "lucide-react";
import ProductForm from "@/components/Seller/ProductForm";

export default function AddProductPage() {
    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">List New Product</h2>
                    <p className="text-gray-500 mt-2 text-lg">Create a high-quality listing for the marketplace.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <Sparkles size={18} className="text-blue-600" />
                    <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Premium Seller Tool</span>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
