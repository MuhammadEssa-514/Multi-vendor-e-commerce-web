import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";
import { Trash2, CheckCircle, XCircle, Store, Mail, Calendar, Search, Users, Eye } from "lucide-react";
import Image from "next/image";
import ViewSellerButton from "../ViewSellerButton";
import SellerActionButtons from "../SellerActionButtons";

// Server Actions
async function toggleApproval(formData: FormData) {
    "use server";
    const sellerId = formData.get("sellerId");
    if (!sellerId) return;

    await dbConnect();
    const seller = await Seller.findById(sellerId);
    if (!seller) return;

    seller.approved = !seller.approved;
    await seller.save();
    revalidatePath("/dashboard/admin/sellers");
}

async function handleDelete(formData: FormData) {
    "use server";
    const sellerId = formData.get("sellerId");
    if (!sellerId) return;

    await dbConnect();
    const seller = await Seller.findById(sellerId);
    if (!seller) return;

    const userId = seller.userId;
    await Product.deleteMany({ sellerId: userId });
    await Seller.findByIdAndDelete(sellerId);
    await User.findByIdAndDelete(userId);

    revalidatePath("/dashboard/admin/sellers");
}

async function getSellers(query: string = "", page: number = 1, limit: number = 20) {
    await dbConnect();
    const skip = (page - 1) * limit;

    const matchStage: any = {};
    if (query) {
        matchStage.storeName = { $regex: query, $options: "i" };
    }

    const [totalSellers, sellers] = await Promise.all([
        Seller.countDocuments(matchStage),
        Seller.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "name email image")
            .lean()
    ]);

    const sellerUserIds = sellers.map((s: any) => s.userId?._id || s.userId);

    const productCounts = await Product.aggregate([
        { $match: { sellerId: { $in: sellerUserIds } } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } }
    ]);

    const countMap = productCounts.reduce((acc: any, curr: any) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    const sellersWithStats = sellers.map((seller: any) => ({
        ...seller,
        _id: seller._id.toString(),
        createdAt: seller.createdAt.toString(),
        productCount: countMap[(seller.userId?._id || seller.userId)?.toString()] || 0,
    }));

    return {
        sellers: sellersWithStats,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalSellers / limit),
            totalSellers
        }
    };
}

export default async function ManageSellersPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q, page: pageParam } = await searchParams;
    const query = q || "";
    const page = parseInt(pageParam || "1");
    const { sellers, pagination } = await getSellers(query, page, 20);

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                        <Store className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
                        <p className="text-sm text-gray-500 font-medium">Overview of marketplace merchants</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search store name..."
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all w-full md:w-64"
                        />
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store Profile</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sellers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                                        No merchants found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller: any) => (
                                    <tr key={seller._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden relative shadow-sm">
                                                    {seller.user?.image ? (
                                                        <Image src={seller.user.image} alt={seller.storeName} fill sizes="40px" className="object-cover" />
                                                    ) : (
                                                        seller.storeName?.charAt(0) || "S"
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900">{seller.storeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{seller.user?.name}</span>
                                                <span className="text-xs text-gray-500">{seller.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Products</span>
                                                    <span className="text-sm font-black text-gray-900">{seller.productCount}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Balance</span>
                                                    <span className="text-sm font-black text-gray-900">₨ {seller.balance.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${seller.approved
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {seller.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-bold">
                                            {new Date(seller.createdAt).toISOString().split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ViewSellerButton seller={seller} />
                                                <SellerActionButtons
                                                    sellerId={seller._id}
                                                    isApproved={seller.approved}
                                                    storeName={seller.storeName}
                                                    toggleApproval={toggleApproval}
                                                    handleDelete={handleDelete}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Simple Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 italic">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <a
                                href={`?page=${pagination.currentPage - 1}${query ? `&q=${query}` : ''}`}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 transition-colors ${pagination.currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Previous
                            </a>
                            <a
                                href={`?page=${pagination.currentPage + 1}${query ? `&q=${query}` : ''}`}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 transition-colors ${pagination.currentPage >= pagination.totalPages ? 'opacity-50 pointer-events-none' : 'bg-white hover:bg-gray-50'}`}
                            >
                                Next
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
