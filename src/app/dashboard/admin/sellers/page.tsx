import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import Admin from "@/models/Admin";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import { revalidatePath } from "next/cache";
import { Trash2, CheckCircle, XCircle, Store, Mail, Calendar, Search, Users, Eye, Package, DollarSign } from "lucide-react";
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
            recipientId: seller._id,
            recipientModel: "Seller",
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

    // Delete seller and their products
    await Product.deleteMany({ sellerId: seller._id });
    await Seller.findByIdAndDelete(sellerId);

    revalidatePath("/dashboard/admin/sellers");
}

async function getSellers(query: string = "", page: number = 1, limit: number = 20) {
    await dbConnect();
    const skip = (page - 1) * limit;

    const matchStage: any = {};
    if (query) {
        matchStage.storeName = { $regex: query, $options: "i" };
    }

    // High level stats for the cards (global, not just current page)
    const [totalSellers, pendingApprovals, globalStats] = await Promise.all([
        Seller.countDocuments({}),
        Seller.countDocuments({ approved: false }),
        Seller.aggregate([
            {
                $group: {
                    _id: null,
                    totalPlatformBalance: { $sum: "$balance" },
                    totalPlatformEarnings: { $sum: "$totalEarnings" }
                }
            }
        ])
    ]);

    const globalEarnings = globalStats[0]?.totalPlatformEarnings || 0;

    const [sellers, totalSearchResults] = await Promise.all([
        Seller.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Seller.countDocuments(matchStage)
    ]);

    const sellerIds = sellers.map((s: any) => s._id);

    const productCounts = await Product.aggregate([
        { $match: { sellerId: { $in: sellerIds } } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } }
    ]);

    // Total Inventory (Global)
    const totalInventoryCount = await Product.countDocuments({});

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
        city: seller.city || "",
        country: seller.country || "",
        productCount: countMap[seller._id.toString()] || 0,
    }));

    return JSON.parse(JSON.stringify({
        sellers: sellersWithStats,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalSearchResults / limit),
            totalSellers: totalSearchResults
        },
        globalStats: {
            totalSellers,
            pendingApprovals,
            totalInventory: totalInventoryCount,
            totalEarnings: globalEarnings
        }
    }));
}

export default async function ManageSellersPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q, page: pageParam } = await searchParams;
    const query = q || "";
    const page = parseInt(pageParam || "1");
    const { sellers, pagination, globalStats } = await getSellers(query, page, 20);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Merchant Ecosystem</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <Store size={14} className="text-indigo-500" /> Infrastructure • Marketplace Governance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <form className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search store name..."
                            className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all w-full md:w-80 text-gray-900 shadow-sm"
                        />
                    </form>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Sellers</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.totalSellers}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[100%] h-full bg-indigo-500 rounded-full" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pending Approval</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.pendingApprovals}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-amber-500 rounded-full" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Global Inventory</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.totalInventory}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-emerald-500 rounded-full" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Gross Earnings</p>
                            <p className="text-xl font-black text-gray-900">₨ {globalStats.totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-blue-500 rounded-full" />
                    </div>
                </div>
            </div>

            <SellerActionsManager
                toggleApprovalAction={toggleApproval}
                handleDeleteAction={handleDelete}
            >
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block w-full">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider rounded-tl-2xl w-[25%]">Merchant Store</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[15%]">Ownership</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[20%]">Performance Stats</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[10%]">Governance</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[15%]">Tenure</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-right rounded-tr-2xl w-[15%]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {sellers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                                            No marketplace records match your query
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.map((seller: any) => (
                                        <tr key={seller._id} className="group hover:bg-gray-100 transition-colors duration-200 border-b border-gray-50 last:border-0 cursor-pointer">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm border border-indigo-100/50 group-hover:scale-105 transition-transform shrink-0">
                                                        {seller.storeName?.charAt(0) || "S"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-black text-gray-900 text-xs tracking-tight truncate max-w-[120px]">{seller.storeName}</span>
                                                            {seller.approved && (
                                                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border border-white shadow-sm shrink-0" title="System Verified">
                                                                    <CheckCircle size={8} className="text-white fill-current" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[120px]">
                                                            <Mail size={9} /> {seller.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-gray-700 tracking-tight truncate max-w-[100px]">{seller.name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">{seller.city || "Global"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">SKUs</span>
                                                        <span className="text-[10px] font-black text-gray-900 mt-0.5">{seller.productCount}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Revenue</span>
                                                        <span className="text-[10px] font-black text-emerald-600 mt-0.5">₨ {(seller.balance || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${seller.approved
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
                                                    }`}>
                                                    {seller.approved ? 'Live' : 'Vetting'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Calendar size={10} />
                                                    <span className="text-[10px] font-bold tracking-tight">
                                                        {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
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

                    {/* Executive Mobile View */}
                    <div className="lg:hidden p-4 space-y-4 bg-gray-50/50">
                        {sellers.length === 0 ? (
                            <div className="py-20 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest bg-white rounded-3xl border border-gray-100 shadow-sm">
                                No records found
                            </div>
                        ) : (
                            sellers.map((seller: any) => (
                                <div key={seller._id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100/50">
                                                {seller.storeName?.charAt(0) || "S"}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900 tracking-tight">{seller.storeName}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{seller.approved ? "Live Merchant" : "Pending Vetting"}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${seller.approved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {seller.approved ? 'Live' : 'Pending'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Inventory</span>
                                            <span className="text-xs font-black text-gray-900">{seller.productCount} SKUs</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Earnings</span>
                                            <span className="text-xs font-black text-emerald-600">₨ {seller.balance?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ViewSellerButton seller={seller} />
                                            <SellerActionButtons seller={seller} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page {pagination.currentPage} of {pagination.totalPages} • Total {pagination.totalSellers} Records
                            </span>
                            <div className="flex gap-3">
                                <a
                                    href={`?page=${pagination.currentPage - 1}${query ? `&q=${query}` : ''}`}
                                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 shadow-sm transition-all ${pagination.currentPage <= 1 ? 'opacity-40 pointer-events-none' : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0'}`}
                                >
                                    Previous
                                </a>
                                <a
                                    href={`?page=${pagination.currentPage + 1}${query ? `&q=${query}` : ''}`}
                                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 shadow-sm transition-all ${pagination.currentPage >= pagination.totalPages ? 'opacity-40 pointer-events-none' : 'bg-white hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0'}`}
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
