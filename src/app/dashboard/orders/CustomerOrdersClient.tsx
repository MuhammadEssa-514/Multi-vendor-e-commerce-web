"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Truck, CheckCircle, Package, Calendar, MapPin, Phone, CreditCard, ShoppingBag, XCircle, AlertCircle } from "lucide-react";
import CustomerOrderTabs from "./CustomerOrderTabs";
import CancelOrderModal from "./CancelOrderModal";

interface Order {
    _id: string;
    products: any[];
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    shippingAddress: any;
    trackingNumber?: string;
    courier?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export default function CustomerOrdersClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "all";

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; orderId: string; orderNumber: string }>({
        isOpen: false,
        orderId: "",
        orderNumber: "",
    });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/orders/customer");
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = tab && tab !== "all"
        ? orders.filter((o) => o.status === tab)
        : orders;

    const handleCancelClick = useCallback((orderId: string, orderNumber: string) => {
        setCancelModal({ isOpen: true, orderId, orderNumber });
    }, []);

    const handleCancelSuccess = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleModalClose = useCallback(() => {
        setCancelModal({ isOpen: false, orderId: "", orderNumber: "" });
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

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
                    filteredOrders.map((order) => (
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
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status || 'pending'}
                                    </span>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelClick(order._id, order._id.slice(-8))}
                                            className="px-3 py-1.5 border-2 border-red-200 text-red-600 rounded-lg text-xs font-black hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-1.5"
                                        >
                                            <XCircle size={14} />
                                            Cancel
                                        </button>
                                    )}
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

                                {/* Logistics / Tracking / Cancellation Info */}
                                <div className="md:col-span-2">
                                    {order.status === 'cancelled' ? (
                                        <>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Cancellation Details</label>
                                            <div className="p-4 rounded-xl border bg-red-50/50 border-red-100">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="text-red-600 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Order Cancelled</p>
                                                        <p className="text-xs text-red-700 font-bold mt-1">
                                                            Reason: {order.cancellationReason || "Not specified"}
                                                        </p>
                                                        {order.cancelledAt && (
                                                            <p className="text-xs text-red-600 font-bold mt-0.5">
                                                                Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()} at {new Date(order.cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
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
                                                            <p className="text-xs text-green-700 font-bold mt-1 text-pretty">Package has been handed over to the customer successfully.</p>
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
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cancel Order Modal */}
            <CancelOrderModal
                orderId={cancelModal.orderId}
                orderNumber={cancelModal.orderNumber}
                isOpen={cancelModal.isOpen}
                onClose={handleModalClose}
                onSuccess={handleCancelSuccess}
            />
        </div>
    );
}
