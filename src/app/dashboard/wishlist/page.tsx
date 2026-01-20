import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import ProductCard from "@/components/product-card";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getUserWishlist(userId: string) {
    await dbConnect();
    const user = await User.findById(userId)
        .populate({
            path: 'wishlist',
            model: Product
        })
        .lean();

    if (!user) return [];

    return (user.wishlist || []).map((product: any) => ({
        ...product,
        _id: product._id.toString(),
        sellerId: product.sellerId?.toString(),
        discount: product.onSale && product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0,
        rating: 4.5 + (Math.random() * 0.5),
        reviews: Math.floor(Math.random() * 200) + 20
    }));
}

export default async function WishlistPage() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const wishlist = await getUserWishlist((session.user as any).id);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">My Wishlist</h2>
                    <p className="text-gray-500 mt-1">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <ShoppingBag size={18} /> Continue Shopping
                </Link>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
                        <Heart className="text-rose-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Save your favorite products here to easily find them later. Click the heart icon on any product to add it to your wishlist.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition"
                    >
                        <ShoppingBag size={18} /> Explore Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
