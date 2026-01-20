import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package, DollarSign, Settings, Lock, Clock } from "lucide-react";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import NotificationCenter from "@/components/notification-center";

async function getSellerProducts(sellerId: string) {
    await dbConnect();
    // Using lean() for better performance as we just display data
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
    // Convert _id and dates to string for serialization
    return products.map((product: any) => ({
        ...product,
        _id: product._id.toString(),
        sellerId: product.sellerId.toString(),
        createdAt: product.createdAt.toString(),
        updatedAt: product.updatedAt.toString(),
    }));
}

export default async function SellerDashboard() {
    const session = await auth();

    if (!session || (session.user as any).role !== "seller") {
        redirect("/dashboard");
    }

    // Check if seller is approved
    await dbConnect();
    const sellerProfile = await Seller.findOne({ userId: (session.user as any).id });

    if (!sellerProfile || !sellerProfile.approved) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <Lock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
                    <p className="text-gray-600 mb-6">
                        {sellerProfile ? `Your store "${sellerProfile.storeName}" is waiting for admin approval.` : "Seller profile not found. Please contact support."}
                    </p>
                    <div className="flex justify-center">
                        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Return to Main Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const products = await getSellerProducts((session.user as any).id);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Track your store's performance and manage your inventory.</p>
            </div>

            {/* Stats Grid - Professional Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-600">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Package size={24} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Inventory</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">{products.length}</div>
                    <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-tighter">Total Active Products</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Available</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">₨ {(sellerProfile.balance || 0).toLocaleString()}</div>
                    <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-tighter">Ready for Withdrawal</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-amber-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Pending</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">₨ {(sellerProfile.pendingEarnings || 0).toLocaleString()}</div>
                    <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-tighter">Awaiting Delivery</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-indigo-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Lifetime</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">₨ {(sellerProfile.totalEarnings || 0).toLocaleString()}</div>
                    <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-tighter">Total Store Revenue</p>
                </div>
            </div>

            {/* Recent Products - Professional Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Your Catalog</h3>
                        <p className="text-xs text-gray-500">Detailed list of all your active products on the storefront.</p>
                    </div>
                    <Link href="/dashboard/seller/add-product" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">
                        + Quick Add
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No products yet</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">Start selling by adding your first product to the marketplace!</p>
                        <Link href="/dashboard/seller/add-product" className="mt-6 inline-flex bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-100">
                            Add First Product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Inventory</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((product: any) => (
                                    <tr key={product._id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-full h-full p-3 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-tighter">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm font-bold text-gray-700">{product.stock} in stock</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900">
                                            ₨ {product.price.toLocaleString()}
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
