
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import Order from "@/models/Order";
import "@/models/Product"; // Ensure Product model is registered for Order refs
import { Check, X, Shield, DollarSign, Package, Users, TrendingUp, ShieldCheck } from "lucide-react";
import ApproveButton from "./ApproveButton";

// Server action/utils
async function getAdminStats(adminId: string) {
    await dbConnect();

    const totalRevenueResult = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments({});
    const activeSellers = await Seller.countDocuments({ approved: true });

    // Get the owner's commission earnings
    const adminUser = await User.findById(adminId).lean();
    const platformEarnings = adminUser?.totalCommissionEarned || 0;

    return {
        totalRevenue,
        totalOrders,
        activeSellers,
        platformEarnings
    };
}

async function getPendingSellers() {
    await dbConnect();

    const sellers = await Seller.aggregate([
        { $match: { approved: false } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                "user.password": 0,
                "user.verificationOTP": 0,
                "user.verificationOTPExpire": 0,
            }
        }
    ]);

    return sellers.map((seller: any) => ({
        ...seller,
        _id: seller._id.toString(),
        userId: seller.userId.toString(),
        createdAt: seller.createdAt.toString(),
        updatedAt: seller.updatedAt.toString(),
        user: seller.user ? {
            name: seller.user.name,
            email: seller.user.email,
            isVerified: seller.user.isEmailVerified
        } : null
    }));
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const [stats, pendingSellers] = await Promise.all([
        getAdminStats((session.user as any).id),
        getPendingSellers()
    ]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center gap-2">
                    <Shield className="h-8 w-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center border-b-4 border-green-500">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate uppercase text-[10px] tracking-widest">Total GMV</dt>
                                <dd className="text-xl font-bold text-gray-900">₨ {stats.totalRevenue.toLocaleString()}</dd>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center border-b-4 border-blue-600">
                        <div className="flex-shrink-0 bg-blue-600 rounded-md p-3">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate uppercase text-[10px] tracking-widest font-bold text-blue-600">Platform Profit</dt>
                                <dd className="text-xl font-bold text-gray-900 border-b border-blue-50">₨ {stats.platformEarnings.toLocaleString()}</dd>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center border-b-4 border-indigo-500">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate uppercase text-[10px] tracking-widest">Orders</dt>
                                <dd className="text-xl font-bold text-gray-900">{stats.totalOrders}</dd>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center border-b-4 border-orange-500">
                        <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate uppercase text-[10px] tracking-widest">Sellers</dt>
                                <dd className="text-xl font-bold text-gray-900">{stats.activeSellers}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Seller Approvals</h3>
                    </div>
                    {pendingSellers.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No pending seller requests.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200">
                            {pendingSellers.map((seller: any) => (
                                <li key={seller._id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-medium text-indigo-600">
                                                {seller.storeName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Owner: {seller.user?.name} ({seller.user?.email})
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <ApproveButton
                                                sellerId={seller._id}
                                                storeName={seller.storeName}
                                                isApproved={seller.approved}
                                            />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
