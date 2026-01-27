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
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-200">
                    <Star className="text-white" size={24} fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Featured Products</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage premium listings on the landing page</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Featured Product</h3>
                <form className="relative max-w-xl">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="q"
                                placeholder="Search products by name..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition"
                                defaultValue={q}
                            />
                        </div>
                        <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">Search</button>
                    </div>
                </form>

                {q && (
                    <div className="mt-6 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Results</h4>
                        {searchResults.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No products found matching "{q}"</p>
                        ) : (
                            <div className="grid gap-4">
                                {searchResults.map((product: any) => (
                                    <div key={product._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                                                {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.sellerId?.storeName}</p>
                                            </div>
                                        </div>
                                        <form action={toggleFeature} className="flex items-center gap-2">
                                            <input type="hidden" name="productId" value={product._id} />
                                            <select name="durationDays" className="text-sm border-gray-200 rounded-lg py-2 px-3 focus:ring-amber-500 focus:border-amber-500 bg-white">
                                                <option value="1">1 Day</option>
                                                <option value="7">1 Week</option>
                                                <option value="30">1 Month</option>
                                            </select>
                                            <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition flex items-center gap-2">
                                                <Zap size={16} fill="currentColor" /> Feature
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Active Featured List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Active Premium Listings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expires</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {featuredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No active featured products.
                                    </td>
                                </tr>
                            ) : (
                                featuredProducts.map((product: any) => (
                                    <tr key={product._id} className="hover:bg-amber-50/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />}
                                                </div>
                                                <span className="font-bold text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {product.sellerId?.storeName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                <Clock size={12} /> {product.featuredExpiresAt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={toggleFeature}>
                                                <input type="hidden" name="productId" value={product._id} />
                                                <input type="hidden" name="durationDays" value="0" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
