"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Truck, CreditCard, Banknote, Smartphone, ChevronLeft } from "lucide-react"; // Icons
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import OrderSuccessModal from "@/components/OrderSuccessModal";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutContent() {
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
    const [isOtherCountry, setIsOtherCountry] = useState(false);
    const [customCountry, setCustomCountry] = useState("");
    const [isOtherCity, setIsOtherCity] = useState(false);
    const [customCity, setCustomCity] = useState("");
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [finalTotal, setFinalTotal] = useState(0);

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
        if (!cartLoading && checkoutItems.length === 0 && !isOrderPlaced) {
            showToast("Your cart is empty. Redirecting...", "info");
            router.push("/");
        }
    }, [checkoutItems, cartLoading, router, showToast, isOrderPlaced]);

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
        "Gilgit": 299, // Added Gilgit
        "Other": 299
    };

    const COUNTRIES = [
        "Pakistan",
        "United States",
        "United Kingdom",
        "Canada",
        "United Arab Emirates",
        "Saudi Arabia",
        "Australia",
        "Germany",
        "China",
        "Other"
    ];

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "country") {
            if (value === "Other") {
                setIsOtherCountry(true);
                setShippingAddress(prev => ({ ...prev, country: "" }));
            } else {
                setIsOtherCountry(false);
                setShippingAddress(prev => ({ ...prev, country: value }));
            }
        } else if (name === "city") {
            if (value === "Other") {
                setIsOtherCity(true);
                setShippingAddress(prev => ({ ...prev, city: "" }));
            } else {
                setIsOtherCity(false);
                setShippingAddress(prev => ({ ...prev, city: value }));
            }
        } else {
            setShippingAddress(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCustomCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomCountry(e.target.value);
        setShippingAddress(prev => ({ ...prev, country: e.target.value }));
    };

    const handleCustomCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomCity(e.target.value);
        setShippingAddress(prev => ({ ...prev, city: e.target.value }));
    };

    const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Calculate shipping fee logic
    let shippingFee = 0;
    if (isOtherCity) {
        shippingFee = SHIPPING_RATES["Other"];
    } else {
        shippingFee = SHIPPING_RATES[shippingAddress.city as keyof typeof SHIPPING_RATES] || 0;
    }

    const total = subtotal + shippingFee;

    const handlePlaceOrder = async () => {
        // Validation
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
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

            const { orderIds } = await res.json();

            setIsOrderPlaced(true);
            setFinalTotal(total);

            if (mode === "direct") {
                clearDirectCheckout();
            } else {
                clearCart();
            }

            if (paymentMethod === "COD") {
                setIsSuccessModalOpen(true);
            } else {
                router.push(`/payment/mock?amount=${total}&orderIds=${orderIds.join(',')}&method=${paymentMethod}`);
            }

        } catch (error: any) {
            console.error(error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOrderPlaced && (cartLoading || checkoutItems.length === 0)) {
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
        <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT COLUMN: Shipping & Payment */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. Shipping Address */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Truck size={20} />
                            </div>
                            Shipping Destination
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    className="block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. John Doe"
                                    value={shippingAddress.fullName}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                                <input
                                    name="phone"
                                    type="text"
                                    required
                                    className="block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. +92 300 1234567"
                                    value={shippingAddress.phone}
                                    onChange={handleAddressChange}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Street Address</label>
                                <input
                                    name="street"
                                    type="text"
                                    required
                                    className="block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="House # / Street # / Area"
                                    value={shippingAddress.street}
                                    onChange={handleAddressChange}
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Country</label>
                                <select
                                    name="country"
                                    className={`block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none cursor-pointer appearance-none ${isOtherCountry ? 'bg-white border-blue-500 ring-2 ring-blue-50' : 'bg-gray-50'}`}
                                    value={isOtherCountry ? "Other" : shippingAddress.country}
                                    onChange={handleAddressChange}
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Custom Country Input */}
                            {isOtherCountry && (
                                <div className="sm:col-span-1 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Specify Country</label>
                                    <input
                                        name="customCountry"
                                        type="text"
                                        required
                                        autoFocus
                                        className="block w-full border-blue-200 rounded-xl shadow-sm p-4 text-sm font-bold bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-blue-900 placeholder-blue-300"
                                        placeholder="Enter country name..."
                                        value={customCountry}
                                        onChange={handleCustomCountryChange}
                                    />
                                </div>
                            )}

                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">City</label>
                                <select
                                    name="city"
                                    required
                                    className={`block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none cursor-pointer appearance-none ${isOtherCity ? 'bg-white border-blue-500 ring-2 ring-blue-50' : 'bg-gray-50'}`}
                                    value={isOtherCity ? "Other" : shippingAddress.city}
                                    onChange={handleAddressChange}
                                >
                                    <option value="">Select City</option>
                                    {Object.keys(SHIPPING_RATES).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Custom City Input */}
                            {isOtherCity && (
                                <div className="sm:col-span-1 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Specify City</label>
                                    <input
                                        name="customCity"
                                        type="text"
                                        required
                                        autoFocus
                                        className="block w-full border-blue-200 rounded-xl shadow-sm p-4 text-sm font-bold bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-blue-900 placeholder-blue-300"
                                        placeholder="Enter city name..."
                                        value={customCity}
                                        onChange={handleCustomCityChange}
                                    />
                                </div>
                            )}

                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Zip Code</label>
                                <input
                                    name="zipCode"
                                    type="text"
                                    required
                                    className="block w-full border-gray-200 rounded-xl shadow-sm p-4 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="Postal Code"
                                    value={shippingAddress.zipCode}
                                    onChange={handleAddressChange}
                                />
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
                orderTotal={isOrderPlaced ? finalTotal : total}
            />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-40 bg-gray-50 rounded-[2rem]"></div>
                        <div className="h-60 bg-gray-50 rounded-[2rem]"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-gray-50 rounded-[2rem]"></div>
                </div>
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">Loading Checkout...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
