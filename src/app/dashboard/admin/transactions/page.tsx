import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Seller from "@/models/Seller";
import Product from "@/models/Product"; // Ensure models are registered
import { ArrowUpRight, ArrowDownRight, Activity, ExternalLink, ClipboardList, Search } from "lucide-react";
import TransactionFilters from "./TransactionFilters";

async function getTransactions(query: string = "", status: string = "") {
    await dbConnect();

    // Build the initial match stage
    const matchStage: any = {};

    if (status && status !== "all") {
        matchStage.status = status;
    }

    // Fetch orders with populated customer data first to filter by name/email if needed
    // However, for large datasets, we should use aggregation for efficiency.
    const orders = await Order.find(matchStage)
        .sort({ createdAt: -1 })
        .populate("customerId", "name email")
        .lean();

    // Filter by query (ID, Customer Name, Email, or Store Name)
    const filteredOrders = await Promise.all(orders.map(async (order: any) => {
        let sellerName = "Multiple Sellers";
        if (order.products && order.products.length > 0 && order.products[0].sellerId) {
            const sellerDoc = await Seller.findOne({ userId: order.products[0].sellerId }).lean();
            if (sellerDoc) sellerName = sellerDoc.storeName;
        }

        const customerName = order.customerId?.name || "Guest User";
        const customerEmail = order.customerId?.email || "";
        const transactionId = order._id.toString();

        // Check if query matches
        const matchesQuery = !query ||
            transactionId.toLowerCase().includes(query.toLowerCase()) ||
            customerName.toLowerCase().includes(query.toLowerCase()) ||
            customerEmail.toLowerCase().includes(query.toLowerCase()) ||
            sellerName.toLowerCase().includes(query.toLowerCase());

        if (!matchesQuery) return null;

        return {
            ...order,
            _id: transactionId,
            userId: order.customerId ? { ...order.customerId, _id: order.customerId._id.toString() } : null,
            sellerName,
            createdAt: order.createdAt.toString(),
            updatedAt: order.updatedAt.toString(),
        };
    }));

    return filteredOrders.filter((o: any) => o !== null);
}

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q, status } = await searchParams;
    const query = q || "";
    const statusFilter = status || "all";

    const transactions = await getTransactions(query, statusFilter);
    const totalRevenue = transactions.reduce((acc: any, curr: any) => acc + curr.total, 0);
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header section with Search and Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Identity & Search */}
                <div className="xl:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-white/10 transition-colors duration-700" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[1.5rem] shadow-inner border border-white/20">
                                <Activity className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">Audit Stream</h1>
                                <p className="text-blue-100 font-medium text-sm">Real-time financial synchronization</p>
                            </div>
                        </div>

                        <TransactionFilters query={query} status={statusFilter} />
                    </div>
                </div>

                {/* Vertical Stats Card */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gross Liquidity</span>
                            <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                                <ArrowUpRight size={14} />
                                12.5%
                            </div>
                        </div>
                        <div className="text-4xl font-black text-gray-900 tracking-tighter mb-6">
                            ₨ {totalRevenue.toLocaleString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Total Volume</span>
                            <span className="text-xl font-black text-blue-700">{totalOrders}</span>
                        </div>
                        <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Avg. Value</span>
                            <span className="text-xl font-black text-emerald-700">₨ {Math.round(avgOrderValue).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden lg:overflow-x-hidden w-full transition-all hover:shadow-xl hover:shadow-gray-200/50">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto p-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="bg-transparent">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ref ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client Account</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Merchant Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Settlement</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clearance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                                <ClipboardList className="text-gray-300" size={48} />
                                            </div>
                                            <div className="max-w-xs mx-auto">
                                                <h3 className="text-lg font-black text-gray-900 mb-1">No Trace Found</h3>
                                                <p className="text-gray-400 text-sm font-medium leading-relaxed italic">The ledger currently holds no matching transaction snapshots for this timeframe.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((order: any) => (
                                    <tr key={order._id} className="group hover:scale-[1.005] transition-all duration-300">
                                        <td className="px-6 py-5 bg-gray-50/50 rounded-l-[1.5rem] border-y border-l border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="font-mono text-[10px] font-black text-gray-500 group-hover:text-blue-600 transition-colors uppercase">
                                                    #{order._id.slice(-8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{order.userId?.name || "Guest User"}</div>
                                            <div className="text-[10px] text-gray-400 font-bold tracking-tight lowercase truncate max-w-[150px]">{order.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                                                    <ExternalLink size={12} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{order.sellerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <span className="text-sm font-black text-gray-900 tabular-nums">₨ {order.total.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-4 ring-emerald-500/5' :
                                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100 ring-4 ring-rose-500/5' :
                                                    'bg-amber-50 text-amber-700 border-amber-100 ring-4 ring-amber-500/5'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' :
                                                    order.status === 'cancelled' ? 'bg-rose-500' :
                                                        'bg-amber-500 animate-pulse'
                                                    }`} />
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 bg-gray-50/50 rounded-r-[1.5rem] border-y border-r border-gray-100 group-hover:bg-white group-hover:border-blue-100">
                                            <div className="text-[11px] text-gray-500 font-black uppercase tracking-tighter">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Ultra-Premium Mobile View */}
                <div className="lg:hidden bg-gray-50/50 p-4 space-y-4">
                    {transactions.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm px-8">
                            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 w-fit mx-auto mb-4">
                                <ClipboardList className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-1 leading-none uppercase tracking-tight">Zero Records</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No matching activities</p>
                        </div>
                    ) : (
                        transactions.map((order: any) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm active:scale-[0.97] transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full -mr-8 -mt-8" />

                                <div className="relative flex items-center justify-between mb-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Asset Snapshot</span>
                                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                                            #{order._id.slice(-8)}
                                        </span>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' :
                                            order.status === 'cancelled' ? 'bg-rose-500' :
                                                'bg-amber-500 animate-pulse'
                                            }`} />
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Activity size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Counterparty</span>
                                            <h4 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{order.userId?.name || "Guest Account"}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                            <ExternalLink size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Execution Store</span>
                                            <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">{order.sellerName}</h4>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-gray-50 border-dashed">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Net Settlement</span>
                                        <span className="text-lg font-black text-emerald-600 tabular-nums leading-none">₨ {order.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Verification Date</span>
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-none">{new Date(order.createdAt).toLocaleDateString()}</span>
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
