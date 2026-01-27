import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { Package, Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductRowActions from "./ProductRowActions";

async function getSellerProducts(sellerId: string) {
    await dbConnect();
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
}

export default async function SellerProductsPage() {
    const session = await auth();

    if (!session || (session.user as any).role !== "seller") {
        redirect("/dashboard");
    }

    const products = await getSellerProducts((session.user as any).id);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">Inventory Management</h2>
                    <p className="text-gray-500 mt-1">Update, delete and organize your product catalog.</p>
                </div>
                <Link
                    href="/dashboard/seller/add-product"
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add New Product
                </Link>
            </div>

            {/* Filter Bar (UI Mock) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your inventory..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-transparent hover:border-gray-200 transition">
                        <Filter size={14} /> Category
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest border border-transparent hover:border-gray-200 transition">
                        Status
                    </button>
                </div>
                <div className="ml-auto text-xs font-black text-gray-400 uppercase tracking-widest">
                    Showing {products.length} Products
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-20 text-center">
                        <Package className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Your catalog is empty</h3>
                        <p className="text-gray-500 mt-2">Start your seller journey by listing your first product.</p>
                        <Link href="/dashboard/seller/add-product" className="mt-8 inline-flex bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100">
                            Create First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-6 py-5">Product Details</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Inventory</th>
                                    <th className="px-6 py-5">Price</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((product: any) => (
                                    <tr key={product._id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm relative">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                                                    ) : (
                                                        <Package className="w-full h-full p-4 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="max-w-[250px]">
                                                    <div className="font-black text-gray-900 truncate leading-tight mb-0.5">{product.name}</div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">SKU: {product._id.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest border border-indigo-100">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                    <span className="text-sm font-black text-gray-700">{product.stock} Units</span>
                                                </div>
                                                <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900">₨ {product.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ProductRowActions productId={product._id.toString()} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
