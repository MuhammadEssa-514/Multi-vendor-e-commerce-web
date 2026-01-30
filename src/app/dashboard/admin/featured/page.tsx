import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import { Search, Star, Clock, Trash2, Zap, CheckCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";

// Server Actions
async function toggleFeature(formData: FormData) {
    "use server";
    const productId = formData.get("productId");
    const durationDays = Number(formData.get("durationDays"));

    if (!productId) return;

    await dbConnect();

    if (durationDays === 0) {
        // Remove feature
        await Product.findByIdAndUpdate(productId, {
            isFeatured: false,
            featuredExpiresAt: null
        });
    } else {
        // Add feature
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await Product.findByIdAndUpdate(productId, {
            isFeatured: true,
            featuredExpiresAt: expiresAt
        });
    }

    revalidatePath("/dashboard/admin/featured");
    revalidatePath("/"); // Update landing page
}

async function getFeaturedProducts() {
    await dbConnect();
    const products = await Product.find({ isFeatured: true })
        .populate("sellerId", "storeName")
        .sort({ featuredExpiresAt: 1 })
        .lean();

    return products.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        sellerId: p.sellerId ? { ...p.sellerId, _id: p.sellerId._id.toString() } : null,
        featuredExpiresAt: p.featuredExpiresAt ? new Date(p.featuredExpiresAt).toLocaleDateString() : "Never"
    }));
}

async function searchProducts(query: string) {
    "use server";
    if (!query) return [];
    await dbConnect();
    const products = await Product.find({
        name: { $regex: query, $options: "i" },
        isFeatured: false
    })
        .populate("sellerId", "storeName")
        .limit(5)
        .lean();

    return products.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        sellerId: p.sellerId ? { ...p.sellerId, _id: p.sellerId._id.toString() } : null,
    }));
}

export default async function FeaturedProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q } = await searchParams;
    const featuredProducts = await getFeaturedProducts();
    const searchResults = q ? await searchProducts(q) : [];

    return (
        <div className="p-3">
            {/* Executive Header */}
            <div className="bg-blue-500 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl">
                        <Star className="text-blue-500" size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Featured Products</h1>
                        <p className="text-sm text-white font-medium">Manage premium listings on the landing page</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Search products by name..."
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full md:w-64 text-black"
                        />
                    </form>
                </div>
            </div>

            {/* Search Results / Promotion Section */}
            {q && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Promotion Results</h3>
                        <span className="text-[10px] font-bold text-gray-400">Found {searchResults.length} products</span>
                    </div>
                    {searchResults.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-sm italic border-2 border-dashed border-gray-50 rounded-xl">
                            No products available to feature matching "{q}"
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {searchResults.map((product: any) => (
                                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden relative border border-gray-100 p-1">
                                            {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover rounded-lg" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{product.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{product.sellerId?.storeName}</p>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <p className="text-[10px] text-blue-500 font-bold">₨ {product.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <form action={toggleFeature} className="flex items-center gap-2">
                                        <input type="hidden" name="productId" value={product._id} />
                                        <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <select name="durationDays" className="text-[11px] font-bold text-gray-600 bg-transparent py-2 pl-3 pr-8 outline-none appearance-none cursor-pointer">
                                                <option value="1">1 Day</option>
                                                <option value="7">1 Week</option>
                                                <option value="30">1 Month</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="flex-1 sm:flex-none h-[38px] bg-blue-500 text-white px-5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                                            <Zap size={14} fill="currentColor" /> Feature
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Active Featured List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:overflow-x-hidden w-full">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Active Premium Listings</h3>
                    <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                        {featuredProducts.length} Currently Featured
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-blue-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Product Information</th>
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Seller Profile</th>
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Expiration Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {featuredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                                        No premium listings currently active.
                                    </td>
                                </tr>
                            ) : (
                                featuredProducts.map((product: any) => (
                                    <tr key={product._id} className="hover:bg-blue-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                    {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />}
                                                </div>
                                                <span className="font-bold text-gray-900 tracking-tight">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{product.sellerId?.storeName}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Merchant</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                                                <Clock size={12} className="text-amber-500" /> {product.featuredExpiresAt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={toggleFeature}>
                                                <input type="hidden" name="productId" value={product._id} />
                                                <input type="hidden" name="durationDays" value="0" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-black hover:text-white rounded-xl transition-all active:scale-95 shadow-sm border border-red-100"
                                                >
                                                    <Trash2 size={14} /> Remove Listing
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden bg-gray-50/50 p-3 space-y-3">
                    {featuredProducts.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 text-sm italic bg-white rounded-3xl border border-gray-100 shadow-sm">
                            No active featured products.
                        </div>
                    ) : (
                        featuredProducts.map((product: any) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-[24px] border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                                        {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-black text-gray-900 truncate tracking-tight">{product.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.sellerId?.storeName}</p>
                                    </div>
                                    <form action={toggleFeature}>
                                        <input type="hidden" name="productId" value={product._id} />
                                        <input type="hidden" name="durationDays" value="0" />
                                        <button
                                            type="submit"
                                            className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-50">
                                        <Clock size={10} className="text-amber-500" />
                                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
                                            Expires: {product.featuredExpiresAt}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg border border-blue-50">
                                        <Zap size={10} className="text-blue-500" fill="currentColor" />
                                        <span className="text-[9px] font-black text-blue-700 uppercase tracking-wider">Premium</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
