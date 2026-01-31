
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import Admin from "@/models/Admin";
import Order from "@/models/Order";
import "@/models/Product"; // Ensure Product model is registered for Order refs
import { Check, X, Shield, DollarSign, Package, Users, TrendingUp, ShieldCheck } from "lucide-react";
import ApproveButton from "./ApproveButton";

// Server action/utils
async function getAdminData(adminId: string) {
    await dbConnect();

    // 1. Core Financials
    const totalRevenueResult = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments({});
    const activeSellers = await Seller.countDocuments({ approved: true });

    // 2. Platform Earnings
    const adminUser = await Admin.findById(adminId).lean();
    const platformEarnings = adminUser?.totalCommissionEarned || 0;

    // 3. Top Performers (Sellers)
    const topSellers = await Seller.find({ approved: true })
        .sort({ totalEarnings: -1 })
        .limit(4)
        .lean();

    // 4. Recently Joined Sellers (Live Request Queue)
    const pendingSellers = await Seller.find({ approved: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // 5. Recent Activity Ledger (Paid Orders)
    // 5. Recent Activity Ledger (Paid Orders)
    const recentActivityRaw = await Order.find({ paymentStatus: "paid" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
            path: "products.sellerId",
            select: "storeName"
        })
        .lean();

    // Transform to maintain UI compatibility (shim sellerId from first product)
    const recentActivity = recentActivityRaw.map((order: any) => ({
        ...order,
        sellerId: order.products?.[0]?.sellerId || null
    }));

    return {
        stats: {
            totalRevenue,
            totalOrders,
            activeSellers,
            platformEarnings
        },
        topSellers: JSON.parse(JSON.stringify(topSellers)),
        pendingSellers: JSON.parse(JSON.stringify(pendingSellers)),
        recentActivity: JSON.parse(JSON.stringify(recentActivity))
    };
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const data = await getAdminData((session.user as any).id);
    const { stats, topSellers, pendingSellers, recentActivity } = data;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Platform Command Center</h1>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> System Operational • Live Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 px-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Velocity</p>
                        <p className="text-xs font-black text-gray-900">+12.5% <span className="text-emerald-500 text-[9px]">↑</span></p>
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Volume */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <DollarSign size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase">GMV</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Gross Volume</p>
                        <p className="text-xl font-black text-gray-900 tracking-tighter">₨ {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Platform Net */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <ShieldCheck size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase">Net</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Net Platform Earnings</p>
                        <p className="text-xl font-black text-gray-900 tracking-tighter">₨ {stats.platformEarnings.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Sellers */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Users size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[8px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase">Merchants</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Active Storefronts</p>
                        <p className="text-xl font-black text-gray-900 tracking-tighter">{stats.activeSellers}</p>
                    </div>
                </div>

                {/* Order Velocity */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Package size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full uppercase">Volume</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Marketplace Orders</p>
                        <p className="text-xl font-black text-gray-900 tracking-tighter">{stats.totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Activity & Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Live Activity Ledger */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Global Settlement Ledger</h3>
                            <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline underline-offset-4">View Full</button>
                        </div>
                        <div className="w-full">
                            <table className="w-full text-left table-fixed">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/30">
                                        <th className="px-6 py-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] w-[25%]">Transaction ID</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] w-[35%]">Merchant</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] w-[20%]">Settlement</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] w-[20%]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    {recentActivity.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-300 font-bold uppercase text-[9px] tracking-widest">No recent settlements</td>
                                        </tr>
                                    ) : (
                                        recentActivity.map((order: any) => (
                                            <tr key={order._id} className="group hover:bg-gray-50/50 transition-all">
                                                <td className="px-6 py-3">
                                                    <span className="text-[10px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors">#{order._id.slice(-6).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-[10px] font-bold text-gray-700 truncate">{(order.sellerId as any)?.storeName || "Direct Sales"}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-[10px] font-black text-emerald-600 leading-none">₨ {order.total.toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-emerald-50 text-[8px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">Paid</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Merchant Leaderboard */}
                    <div className="bg-[#111827] rounded-[2rem] p-6 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-32 translate-x-32 blur-[80px]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-black tracking-tighter mb-0.5">Top Merchants</h3>
                                    <p className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em]">Detailed Revenue</p>
                                </div>
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                    <TrendingUp size={16} className="text-indigo-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {topSellers.map((seller: any, idx: number) => (
                                    <div key={seller._id} className="bg-white/5 border border-white/10 p-4 rounded-2xl group/card hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`w-5 h-5 rounded-lg ${idx === 0 ? "bg-amber-400" : "bg-white/20"} flex items-center justify-center text-[9px] font-black text-[#111827]`}>{idx + 1}</span>
                                            <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">Verified</span>
                                        </div>
                                        <h4 className="font-black text-xs mb-0.5 group-hover/card:text-indigo-400 transition-colors uppercase tracking-tight truncate">{seller.storeName}</h4>
                                        <p className="text-sm font-black tracking-tighter opacity-90">₨ {(seller.totalEarnings || 0).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Pending & Requests */}
                <div className="space-y-6">
                    {/* Pending Approvals */}
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                <Users size={14} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Waitlist</h3>
                        </div>

                        {pendingSellers.length === 0 ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                    <Check size={24} />
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">All clear</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingSellers.map((seller: any) => (
                                    <div key={seller._id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-indigo-100 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-gray-900 mb-0.5 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[120px]">{seller.storeName}</p>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{(seller as any).city}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                                <ShieldCheck size={12} />
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 border-dashed">
                                            <ApproveButton
                                                sellerId={seller._id}
                                                storeName={seller.storeName}
                                                isApproved={false}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">Clear Queue</button>
                            </div>
                        )}
                    </div>

                    {/* Quick Analytics Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-100">
                        <TrendingUp size={24} className="mb-4 opacity-50" />
                        <h4 className="text-base font-black tracking-tighter leading-snug mb-1">Quarterly Velocity</h4>
                        <p className="text-[10px] font-medium text-indigo-100/70 leading-relaxed mb-4">Your platform has seen 14% growth in merchant onboarding this month.</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="w-[74%] h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">74% Capacity</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
