import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Seller from "@/models/Seller";
import Product from "@/models/Product"; // Ensure models are registered
import { ClipboardList, ExternalLink, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

async function getTransactions() {
    await dbConnect();
    // Fetch all orders sorted by date
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate("customerId", "name email")
        .lean();

    // Manually populate seller info if needed or rely on order structure
    // Since Order model might store seller Id inside items or top level depending on your schema.
    // Assuming your Order schema has a sellerId field or we derive it from items.
    // For simplicity, let's assume Order has sellerId based on your previous messages about seller dashboard.
    // Enhanced fetching logic:

    // We need to fetch seller details manually if populate doesn't work out of the box or if schema is complex
    const ordersWithDetails = await Promise.all(orders.map(async (order: any) => {
        let sellerName = "Multiple Sellers";
        // If order splits per seller, we might need logic here. 
        // For now, if products[0].sellerId exists, we can try to fetch.
        if (order.products && order.products.length > 0 && order.products[0].sellerId) {
            const seller = await Seller.findOne({ userId: order.products[0].sellerId }).lean(); // Correctly finding seller by userId match or _id depending on schema. 
            // IMPORTANT: Seller model (from previous context) links to User via userId. Order stores sellerId (which is likely User's ID or Seller Doc ID).
            // Let's assume Order's sellerId ref is "User" (as seen in Order.ts line 20).
            // So we actually need to look up the 'Seller' document where userId matches this ID to get the Store Name.

            // Wait, Order.ts says sellerId ref: "User". 
            // So we can find the User directly. But we want Store Name.
            // Store Name is in Seller model. Seller model has userId.
            const sellerDoc = await Seller.findOne({ userId: order.products[0].sellerId }).lean();
            if (sellerDoc) sellerName = sellerDoc.storeName;
        }

        return {
            ...order,
            _id: order._id.toString(),
            // Map customerId to userId for UI consistency or just access customerId
            userId: order.customerId ? { ...order.customerId, _id: order.customerId._id.toString() } : null,
            sellerName,
            createdAt: order.createdAt.toString(),
            updatedAt: order.updatedAt.toString(),
        };
    }));

    return ordersWithDetails;
}

export default async function TransactionsPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const transactions = await getTransactions();

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200">
                    <ClipboardList className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 font-medium">Global view of all platform orders</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{order.userId?.name || "Guest"}</div>
                                            <div className="text-xs text-gray-500">{order.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                            {order.sellerName}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ₨ {order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
