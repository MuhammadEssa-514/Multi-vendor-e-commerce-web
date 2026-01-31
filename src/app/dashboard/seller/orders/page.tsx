
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import OrderTabs from "./OrderTabs";
import OrderSearch from "./OrderSearch";
import OrderActions from "./OrderActions";
import { ListFilter, Package, Truck, CheckCircle, Mail, MapPin, Phone, Calendar } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getSellerOrders(sellerId: string) {
    await dbConnect();
    // Find orders that contain at least one product from this seller
    const orders = await Order.find({ "products.sellerId": sellerId })
        .sort({ createdAt: -1 })
        .lean();

    const enrichedOrders = await Promise.all(orders.map(async (order: any) => {
        const customer = await Customer.findById(order.customerId).lean();

        // Filter products for this seller
        const myProducts = order.products.filter((p: any) => p.sellerId.toString() === sellerId);

        // Get product details for these items
        const productsWithDetails = await Promise.all(myProducts.map(async (item: any) => {
            const productDef = await Product.findById(item.productId).lean();
            return {
                ...item,
                name: productDef?.name || "Unknown Product",
                image: productDef?.images?.[0] || ""
            };
        }));

        return {
            _id: order._id.toString(),
            createdAt: order.createdAt.toString(),
            status: order.status || "pending",
            paymentStatus: order.paymentStatus,
            customerName: customer?.name || "Unknown",
            customerEmail: customer?.email || "No Email",
            shippingAddress: order.shippingAddress,
            trackingNumber: order.trackingNumber,
            courier: order.courier,
            items: productsWithDetails,
            totalForSeller: myProducts.reduce((acc: number, curr: any) => acc + (curr.price * curr.quantity), 0)
        };
    }));

    return enrichedOrders;
}

export default async function SellerOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; q?: string }>;
}) {
    const session = await auth();
    if (!session || (session.user as any).role !== "seller") redirect("/dashboard");

    const allOrders = await getSellerOrders((session.user as any).id);
    const { tab, q } = await searchParams;

    // Apply Search Filter first
    let searchedOrders = allOrders;
    if (q) {
        const query = q.toLowerCase();
        searchedOrders = allOrders.filter(o => {
            const matchId = o._id.toLowerCase().includes(query);
            const matchCustomer = o.customerName.toLowerCase().includes(query) || o.customerEmail.toLowerCase().includes(query);
            const matchTracking = o.trackingNumber?.toLowerCase().includes(query);
            const matchProducts = o.items.some((item: any) => item.name.toLowerCase().includes(query));

            return matchId || matchCustomer || matchTracking || matchProducts;
        });
    }

    // Calculate Counts (based on searched orders or all orders? User usually wants counts for the active view, but tabs usually show global counts. Let's use global counts for clarity.)
    const counts = {
        all: allOrders.length,
        pending: allOrders.filter(o => o.status === "pending").length,
        shipped: allOrders.filter(o => o.status === "shipped").length,
        delivered: allOrders.filter(o => o.status === "delivered").length,
    };

    // Filter by Tab (using the searched results)
    const filteredOrders = tab && tab !== "all"
        ? searchedOrders.filter(o => o.status === tab)
        : searchedOrders;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">Order Management</h2>
                    <p className="text-gray-500 mt-1">Track, manage and fulfill your customer orders.</p>
                </div>
            </div>

            <OrderSearch />
            <OrderTabs counts={counts} />

            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-2xl border border-gray-100 shadow-sm">
                        <Package className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">
                            {q ? `No orders matching "${q}"` : `No ${tab || "all"} orders found`}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            {q ? "Try searching for a different ID, name or email." : "When customers buy your products, they will appear here."}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                            {/* Order Header */}
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-blue-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Order #{order._id.slice(-8)}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] font-black uppercase tracking-tighter rounded-md ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.status || 'pending'}
                                        </span>
                                    </div>
                                    <OrderActions
                                        orderId={order._id}
                                        currentStatus={order.status}
                                        hasTracking={!!order.trackingNumber}
                                        initialTracking={order.trackingNumber}
                                        initialCourier={order.courier}
                                    />
                                </div>
                            </div>

                            {/* Tracking Detail Bar (for Shipped/Delivered) */}
                            {order.trackingNumber && (
                                <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                                    <Truck size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                        Tracking: <span className="text-blue-900">{order.courier} - {order.trackingNumber}</span>
                                    </span>
                                </div>
                            )}

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Customer & Shipping */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Customer Info</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {order.customerName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Shipping Destination</label>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-xs font-bold text-gray-700">{order.shippingAddress?.fullName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{order.shippingAddress?.street}</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                                            <p className="text-xs text-indigo-600 font-bold mt-2">{order.shippingAddress?.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Column: Products Table */}
                                <div className="lg:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Order Items ({order.items.length})</label>
                                    <div className="border border-gray-50 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-4 py-2">Item</th>
                                                    <th className="px-4 py-2">Qty</th>
                                                    <th className="px-4 py-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {order.items.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="32px" className="object-cover" /> : <Package className="w-full h-full p-2 text-gray-300" />}
                                                                </div>
                                                                <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-gray-500">x{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right font-black text-gray-900">₨ {(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-blue-50/50">
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">Your Earnings</td>
                                                    <td className="px-4 py-3 text-right text-lg font-black text-blue-700">₨ {order.totalForSeller.toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
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
