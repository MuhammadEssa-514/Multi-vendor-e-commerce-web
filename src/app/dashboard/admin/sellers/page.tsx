import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";
import { Trash2, CheckCircle, XCircle, Store, Mail, Calendar, Search, Users, Eye } from "lucide-react";
import ViewSellerButton from "../ViewSellerButton";
import SellerActionButtons from "../SellerActionButtons";
import SellerActionsManager from "../SellerActionsManager";

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

    // Notify the Seller about the status change
    try {
        await Notification.create({
            recipientId: seller.userId,
            recipientModel: "User",
            type: "seller_approval",
            title: "Account Status Update",
            message: `Your seller account for "${seller.storeName}" has been ${seller.approved ? "Approved! You can now start listing products." : "set to Pending. Please contact support for more details."}`,
        });
    } catch (notifyError) {
        console.error("Failed to notify seller:", notifyError);
    }

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
            .populate("userId", "name email image city country")
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
        createdAt: seller.createdAt.toISOString(),
        cnic: seller.cnic || "",
        phoneNumber: seller.phoneNumber || "",
        city: seller.userId?.city || "",
        country: seller.userId?.country || "",
        userId: seller.userId ? {
            ...seller.userId,
            _id: seller.userId._id.toString()
        } : null,
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
        <div className="p-3">
            <div className="bg-blue-500 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl">
                        <Store className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manage Sellers</h1>
                        <p className="text-sm text-white font-medium">Overview of marketplace merchants</p>
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
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all w-full md:w-64 text-black"
                        />
                    </form>
                </div>
            </div>

            <SellerActionsManager
                toggleApprovalAction={toggleApproval}
                handleDeleteAction={handleDelete}
            >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:overflow-x-hidden w-full">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-blue-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Store Profile</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-500 ">
                                {sellers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                                            No merchants found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.map((seller: any) => (
                                        <tr key={seller._id} className="hover:bg-blue-100 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 flex-shrink-0">
                                                        {seller.storeName?.charAt(0) || "S"}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{seller.storeName}</span>
                                                    {seller.approved && (
                                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center border border-white flex-shrink-0" title="Verified Merchant">
                                                            <CheckCircle size={10} className="text-white fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{seller.userId?.name}</span>
                                                    <span className="text-xs text-gray-500">{seller.userId?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Products</span>
                                                        <span className="text-xs font-bold text-gray-900 leading-none mt-1">{seller.productCount}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Balance</span>
                                                        <span className="text-xs font-bold text-gray-900 leading-none mt-1 whitespace-nowrap">₨ {seller.balance.toLocaleString()}</span>
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
                                                {new Date(seller.createdAt).toLocaleDateString('en-CA')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ViewSellerButton seller={seller} />
                                                    <SellerActionButtons seller={seller} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Executive Luxury Mobile View - Hidden on Desktop */}
                    <div className="lg:hidden bg-gray-50/50 p-2.5 space-y-2.5">
                        {sellers.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 text-sm italic bg-white rounded-2xl border border-gray-100 shadow-sm">
                                No merchants found matching your criteria.
                            </div>
                        ) : (
                            sellers.map((seller: any) => (
                                <div
                                    key={seller._id}
                                    className="bg-gray-200 rounded-[20px] border border-gray-100 p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-all duration-300 relative group overflow-hidden"
                                >
                                    {/* Status Badge: Optimized Position */}
                                    <div className={`absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${seller.approved
                                        ? 'bg-emerald-50/90 text-emerald-700 border-emerald-100'
                                        : 'bg-amber-50/90 text-amber-700 border-amber-100'
                                        }`}>
                                        {seller.approved ? 'Approved' : 'Pending'}
                                    </div>

                                    {/* Glassmorphism Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/30 transition-colors" />

                                    {/* Card Header: Store Profile */}
                                    <div className="relative flex items-center gap-3.5 mb-4 pr-16">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-100 transform -rotate-2 flex-shrink-0">
                                            {seller.storeName?.charAt(0) || "S"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-sm font-black text-gray-900 truncate tracking-tight">{seller.storeName}</h3>
                                                {seller.approved && (
                                                    <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle size={8} className="text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                    {seller.approved ? "Verified Merchant" : "Pending Verification"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content: Owner Details */}
                                    <div className="relative mb-4 space-y-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-4.5 h-4.5 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                                <Users size={9} className="text-gray-400" />
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-700 truncate">{seller.userId?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-4.5 h-4.5 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                                <Mail size={9} className="text-gray-400" />
                                            </div>
                                            <span className="text-[11px] font-medium text-gray-500 truncate">{seller.userId?.email}</span>
                                        </div>
                                    </div>

                                    {/* Card Stats: Ultra-Compact Grid */}
                                    <div className="relative grid grid-cols-2 gap-2 mb-4">
                                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col">
                                            <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Inventory</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-black text-gray-900">{seller.productCount}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">SKUs</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col">
                                            <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Earnings</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-black text-emerald-600">₨ {seller.balance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Compact Actions */}
                                    <div className="relative flex items-center justify-between pt-3.5 border-t border-gray-100">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-50/50 rounded-lg border border-gray-100/50">
                                            <Calendar size={9} className="text-gray-400" />
                                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tight">
                                                {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center bg-gray-50/80 p-0.5 rounded-lg border border-gray-100">
                                                <ViewSellerButton seller={seller} />
                                                <div className="w-px h-2.5 bg-gray-200 mx-0.5" />
                                                <SellerActionButtons seller={seller} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
            </SellerActionsManager>
        </div>
    );
}
