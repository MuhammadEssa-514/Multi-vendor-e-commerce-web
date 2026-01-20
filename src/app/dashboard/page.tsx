import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Package, Clock, Truck, CheckCircle, CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

async function getCustomerStats(userId: string) {
    await dbConnect();
    const orders = await Order.find({ customerId: userId }).lean();

    return {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        shippedOrders: orders.filter((o: any) => o.status === 'shipped').length,
        totalSpent: orders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
    };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    // If seller, they should probably be at /dashboard/seller, but we'll show them a link
    if ((session.user as any).role === 'seller') {
        redirect("/dashboard/seller");
    }

    const stats = await getCustomerStats((session.user as any).id);

    const statCards = [
        { name: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "In Preparation", value: stats.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "In Transit", value: stats.shippedOrders, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "Total Spent", value: `₨ ${stats.totalSpent.toLocaleString()}`, icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900">Account Overview</h2>
                <p className="text-gray-500 mt-1">Manage your activity and track your recent purchases.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.name}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4">Ready for your next find?</h3>
                        <p className="text-indigo-100 mb-6 max-w-md font-medium">Explore thousands of products from local and international sellers. Quick delivery and secure payments guaranteed.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-sm font-black hover:bg-gray-50 transition shadow-lg"
                        >
                            <ShoppingBag size={18} /> Start Shopping
                        </Link>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl ml-20 mb-20"></div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-4">Support Center</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Need help with an order or have questions about a product?</p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-50 group hover:border-indigo-100 transition-colors">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-indigo-600 shadow-sm">
                                <Package size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Track Order</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time logistics</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/orders"
                            className="block text-center py-3 text-indigo-600 font-black text-sm hover:underline"
                        >
                            View Support Articles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
