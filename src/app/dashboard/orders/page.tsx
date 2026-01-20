import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Link from "next/link";
import { Truck, CheckCircle, Package, Calendar, MapPin, Phone, CreditCard, ShoppingBag } from "lucide-react";
import CustomerOrderTabs from "./CustomerOrderTabs";

export const dynamic = "force-dynamic";

async function getUserOrders(userId: string) {
    await dbConnect();
    const orders = await Order.find({ customerId: userId }).sort({ createdAt: -1 }).lean();
    return orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt.toString(),
        updatedAt: order.updatedAt.toString(),
    }));
}

export default async function CustomerOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const { tab } = await searchParams;
    const allOrders = await getUserOrders((session.user as any).id);

    // Filter by Tab
    const filteredOrders = tab && tab !== "all"
        ? allOrders.filter((o: any) => o.status === tab)
        : allOrders;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">My Orders</h2>
                    <p className="text-gray-500 mt-1">Track and manage your purchase history.</p>
                </div>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <ShoppingBag size={18} /> Continue Shopping
                </Link>
            </div>

            <CustomerOrderTabs />

            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-2xl border border-gray-100 shadow-sm">
                        <Package className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No {tab || "all"} orders found</h3>
                        <p className="text-gray-500 mt-1">When you buy products, they will appear here.</p>
                    </div>
                ) : (
                    filteredOrders.map((order: any) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-indigo-100 transition-colors">
                            {/* Order Header */}
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-indigo-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Order #{order._id.slice(-8)}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-black uppercase tracking-tighter rounded-md ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status || 'pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Order Summary */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Amount</label>
                                        <p className="text-xl font-black text-gray-900">₨ {order.total.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Payment</label>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 capitalize">
                                            <CreditCard size={14} className="text-gray-400" />
                                            {order.paymentStatus} ({order.paymentMethod})
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics / Tracking */}
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Delivery Details</label>
                                    <div className={`p-4 rounded-xl border ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                                        {(order.trackingNumber || order.status === 'shipped') ? (
                                            <div className="flex items-start gap-3">
                                                <Truck className="text-indigo-600 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">Logistics Tracking</p>
                                                    {order.trackingNumber ? (
                                                        <div className="mt-1">
                                                            <p className="text-xs text-indigo-700 font-bold">Courier: <span className="text-indigo-900 font-black">{order.courier || "Standard"}</span></p>
                                                            <p className="text-xs text-indigo-700 font-bold mt-0.5">ID: <span className="underline decoration-dotted text-indigo-900 font-black">{order.trackingNumber}</span></p>
                                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                                Package in Transit
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-indigo-500 italic mt-1 font-bold">Your tracking ID will appear very shortly...</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : order.status === 'delivered' ? (
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="text-green-600 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-sm font-black text-green-900 uppercase tracking-tight">Delivered</p>
                                                    <p className="text-xs text-green-700 font-bold mt-1 text-pretty">Package has been handed over to the customer successully.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-3 text-gray-400">
                                                <Calendar size={18} className="mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight">Order Pending</p>
                                                    <p className="text-xs font-bold mt-1">The seller is currently preparing your package for shipment.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
