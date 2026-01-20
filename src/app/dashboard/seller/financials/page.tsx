import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import Seller from "@/models/Seller";
import { ArrowLeft, DollarSign, Download, TrendingUp, History, Info } from "lucide-react";
import Link from "next/link";

async function getFinancialData(userId: string) {
    await dbConnect();
    const seller = await Seller.findOne({ userId }).lean();
    const transactions = await Transaction.find({ sellerId: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    return {
        seller: seller ? JSON.parse(JSON.stringify(seller)) : null,
        transactions: JSON.parse(JSON.stringify(transactions))
    };
}

export default async function SellerFinancials() {
    const session = await auth();
    if (!session || (session.user as any).role !== "seller") {
        redirect("/dashboard");
    }

    const { seller, transactions } = await getFinancialData((session.user as any).id);

    if (!seller) return <div>Loading...</div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">Financial Overview</h2>
                    <p className="text-gray-500 mt-1">Manage your payouts, track clearances, and view history.</p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Payouts Enabled</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balances */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Available Balance</h3>
                                <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg shadow-emerald-100">
                                    <DollarSign size={18} />
                                </div>
                            </div>
                            <div className="text-5xl font-black text-gray-900 mb-8 tracking-tighter">₨ {(seller.balance || 0).toLocaleString()}</div>
                            <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-[0.98]">
                                Withdraw Funds
                            </button>
                            <p className="text-[10px] text-gray-400 mt-4 text-center font-bold tracking-tight">Minimum withdrawal: ₨ 1,000</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500" /> Earnings Analytics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 border border-amber-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">In Clearance</span>
                                <span className="font-black text-amber-600 text-sm">₨ {(seller.pendingEarnings || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/50 border border-blue-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Total Revenue</span>
                                <span className="font-black text-blue-600 text-sm">₨ {(seller.totalEarnings || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50/50 border border-rose-50">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Commissions</span>
                                <span className="font-black text-rose-500 text-sm">₨ {(seller.commissionPaid || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Transaction History</h3>
                                <p className="text-xs text-gray-500">Log of all movements in your store account.</p>
                            </div>
                            <button className="bg-white border border-gray-100 p-2 rounded-lg text-gray-500 hover:text-blue-600 transition shadow-sm">
                                <Download size={18} />
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="p-20 text-center">
                                <History className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No transactions recorded</h3>
                                <p className="text-gray-500 mt-1">Complete your first sale to start generating revenue.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Ref #</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Fee (10%)</th>
                                            <th className="px-6 py-4">Your Share</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.map((tx: any) => (
                                            <tr key={tx._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4 font-black text-gray-400 text-xs">#{tx.orderId.slice(-8)}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 text-sm">₨ {tx.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-rose-500 font-bold text-xs">₨ {tx.commission.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-blue-600 font-black text-sm group-hover:scale-105 transition-transform origin-left">₨ {tx.sellerShare.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="p-4 bg-gray-50 border-t border-gray-50 text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-center gap-1.5 mt-1">
                                <Info size={12} className="text-blue-500" /> Funds release 24h post delivery confirmation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
