"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, CreditCard, Banknote, Smartphone, ChevronLeft } from "lucide-react"; // Icons
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import OrderSuccessModal from "@/components/OrderSuccessModal";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const { showToast } = useToast();

    const { cart, clearCart, directCheckoutItem, clearDirectCheckout, loading: cartLoading } = useCart();

    // Determine which items to use
    const checkoutItems = mode === "direct" && directCheckoutItem ? [directCheckoutItem] : cart;

    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Shipping Address State
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        zipCode: "",
        country: "Pakistan"
    });

    useEffect(() => {
        // Only redirect if both cart and direct item are empty, and we're not loading
        if (!cartLoading && checkoutItems.length === 0) {
            showToast("Your cart is empty. Redirecting...", "info");
            router.push("/");
        }
    }, [checkoutItems, cartLoading, router, showToast]);

    const SHIPPING_RATES: Record<string, number> = {
        "Karachi": 99,
        "Lahore": 149,
        "Islamabad": 149,
        "Rawalpindi": 149,
        "Faisalabad": 199,
        "Multan": 199,
        "Peshawar": 199,
        "Quetta": 249,
        "Sialkot": 199,
        "Gujranwala": 199,
        "Other": 299
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = SHIPPING_RATES[shippingAddress.city as keyof typeof SHIPPING_RATES] || 0;
    const total = subtotal + shippingFee;

    const handlePlaceOrder = async () => {
        // Validation
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
            showToast("Please fill in all shipping details.", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: checkoutItems,
                    total,
                    paymentMethod,
                    shippingAddress,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Order failed");
            }

            const { orderId } = await res.json();

            if (mode === "direct") {
                clearDirectCheckout();
            } else {
                clearCart();
            }

            if (paymentMethod === "COD") {
                setIsSuccessModalOpen(true);
            } else {
                router.push(`/payment/mock?amount=${total}&orderId=${orderId}&method=${paymentMethod}`);
            }

        } catch (error: any) {
            console.error(error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (cartLoading || checkoutItems.length === 0) {
        return (
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-40 bg-gray-50 rounded-[2rem]"></div>
                        <div className="h-60 bg-gray-50 rounded-[2rem]"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-gray-50 rounded-[2rem]"></div>
                </div>
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">Preparing Checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Shipping & Payment */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Shipping Address */}
                    <div className="bg-white p-6 rounded-md shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="text-blue-600" size={20} /> Shipping Address
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input name="fullName" type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={shippingAddress.fullName} onChange={handleAddressChange} />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input name="phone" type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={shippingAddress.phone} onChange={handleAddressChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                <input name="street" type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={shippingAddress.street} onChange={handleAddressChange} />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <select
                                    name="city"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                >
                                    <option value="">Select City</option>
                                    {Object.keys(SHIPPING_RATES).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input name="zipCode" type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={shippingAddress.zipCode} onChange={handleAddressChange} />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input name="country" type="text" readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-500" value="Pakistan" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Payment Methods */}
                    <div className="bg-white p-6 rounded-md shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="text-blue-600" size={20} /> Payment Method
                        </h2>
                        <div className="space-y-3">
                            {/* COD */}
                            <label className={`flex items-center p-4 border rounded-md cursor-pointer transition ${paymentMethod === "COD" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                                <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                <div className="ml-3 flex items-center gap-2">
                                    <Banknote size={24} className="text-green-600" />
                                    <span className="font-medium text-gray-900">Cash on Delivery</span>
                                </div>
                            </label>

                            {/* Digital Wallets */}
                            <label className={`flex items-center p-4 border rounded-md cursor-pointer transition ${paymentMethod === "JazzCash" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                                <input type="radio" name="payment" value="JazzCash" checked={paymentMethod === "JazzCash"} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                <div className="ml-3 flex items-center gap-2">
                                    <Smartphone size={24} className="text-red-600" />
                                    <span className="font-medium text-gray-900">JazzCash</span>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-md cursor-pointer transition ${paymentMethod === "EasyPaisa" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                                <input type="radio" name="payment" value="EasyPaisa" checked={paymentMethod === "EasyPaisa"} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                <div className="ml-3 flex items-center gap-2">
                                    <Smartphone size={24} className="text-green-500" />
                                    <span className="font-medium text-gray-900">EasyPaisa</span>
                                </div>
                            </label>

                            {/* PayPal */}
                            <label className={`flex items-center p-4 border rounded-md cursor-pointer transition ${paymentMethod === "PayPal" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                                <input type="radio" name="payment" value="PayPal" checked={paymentMethod === "PayPal"} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                <div className="ml-3 flex items-center gap-2">
                                    <CreditCard size={24} className="text-blue-800" />
                                    <span className="font-medium text-gray-900">PayPal / Card</span>
                                </div>
                            </label>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-md shadow-sm sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <ul className="divide-y divide-gray-200 border-b border-t border-gray-200 mb-4 text-sm">
                            {checkoutItems.map((item) => (
                                <li key={item._id} className="py-3 flex justify-between">
                                    <div className="flex-1 pr-4">
                                        <span className="font-medium block">{item.name}</span>
                                        <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                    </div>
                                    <div className="font-medium">₨ {item.price * item.quantity}</div>
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₨ {subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Fee</span>
                                <span>₨ {shippingFee}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-blue-600 pt-2 border-t">
                                <span>Total</span>
                                <span>₨ {total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full mt-6 bg-orange-500 border border-transparent rounded-sm shadow-sm py-3 px-4 text-base font-bold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 uppercase tracking-wide"
                        >
                            {loading ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>

            </div>
            {/* Order Success Modal */}
            <OrderSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => router.push("/")}
                onViewOrders={() => router.push("/dashboard/orders")}
                orderTotal={total}
            />
        </div>
    );
}
