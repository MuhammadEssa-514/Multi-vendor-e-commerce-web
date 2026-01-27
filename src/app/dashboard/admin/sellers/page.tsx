import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import Product from "@/models/Product";
import { Trash2, CheckCircle, XCircle, Store } from "lucide-react";
import { revalidatePath } from "next/cache";
import SellerTableRow from "../SellerTableRow";
import SellerSearch from "../SellerSearch";

// Server Actions
async function deleteSeller(formData: FormData) {
    "use server";
    const sellerId = formData.get("sellerId");
    if (!sellerId) return;

    await dbConnect();

    // 1. Find the seller to get the userId
    const seller = await Seller.findById(sellerId);
    if (!seller) return;

    const userId = seller.userId;

    // 2. Delete all products belonging to this seller
    // We use the userId here because Product model stores sellerId as the user's ID
    await Product.deleteMany({ sellerId: userId });

    // 3. Delete the seller profile
    await Seller.findByIdAndDelete(sellerId);

    // 4. Delete the user account
    await User.findByIdAndDelete(userId);

    revalidatePath("/dashboard/admin/sellers");
}


async function getSellers(query: string = "") {
    await dbConnect();

    // Create filter object
    const filter: any = {};
    if (query) {
        filter.storeName = { $regex: query, $options: "i" };
    }

    const sellers = await Seller.find(filter).sort({ createdAt: -1 }).lean();

    let totalCommission = 0;
    let pendingApprovals = 0;

    // Populate user details and stats manually
    const sellersWithStats = await Promise.all(sellers.map(async (seller: any) => {
        const [user, productCount] = await Promise.all([
            User.findById(seller.userId).lean(),
            Product.countDocuments({ sellerId: seller.userId })
        ]);

        totalCommission += seller.commissionPaid || 0;
        if (!seller.approved) pendingApprovals++;

        return {
            ...seller,
            _id: seller._id.toString(),
            userId: seller.userId.toString(),
            createdAt: seller.createdAt.toString(),
            productCount,
            user: user ? {
                name: user.name,
                email: user.email,
                image: user.image,
                isVerified: user.isEmailVerified
            } : null
        };
    }));

    return {
        sellers: sellersWithStats,
        stats: {
            total: sellers.length,
            pending: pendingApprovals,
            revenue: totalCommission
        }
    };
}

export default async function ManageSellersPage({ searchParams }: { searchParams: { q?: string } }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const query = searchParams?.q || "";
    const { sellers, stats } = await getSellers(query);

    return (
        <div className="p-4 sm:p-10 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC]">
            {/* Page Header */}
            <div className="relative mb-12 p-8 sm:p-12 rounded-[2.5rem] bg-indigo-900 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-600/20 skew-x-[-20deg] translate-x-1/2 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-inner">
                            <Store className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Seller Command</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                                    Adaptive System v2
                                </span>
                                <span className="text-indigo-200/60 font-bold text-xs">Manage your marketplace ecosystem</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="relative group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-6 right-6 p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Store size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Merchants</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total}</p>
                    </div>
                </div>

                <div className="relative group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-6 right-6 p-4 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Pending Approval</p>
                        <div className="flex items-center gap-3">
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.pending}</p>
                            {stats.pending > 0 && (
                                <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100">URGENT</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative group bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] shadow-lg shadow-indigo-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <div className="relative z-10">
                        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Platform revenue</p>
                        <p className="text-4xl font-black text-white tracking-tighter">${stats.revenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* List Header & Search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Registrations</h3>
                <div className="flex items-center gap-3">
                    <SellerSearch />
                    <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAFBFE] border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Merchant Profile</th>
                                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Growth & Stats</th>
                                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financial Status</th>
                                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">System Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sellers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-6 bg-gray-50 rounded-full text-gray-300">
                                                <Store size={48} />
                                            </div>
                                            <p className="text-gray-400 font-bold">No merchants onboarded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller: any) => (
                                    <SellerTableRow
                                        key={seller._id}
                                        seller={seller}
                                        deleteSellerAction={async (id) => {
                                            "use server";
                                            const formData = new FormData();
                                            formData.append("sellerId", id);
                                            await deleteSeller(formData);
                                        }}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
