"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Truck,
    CreditCard,
    Banknote,
    Smartphone,
    ChevronLeft,
    ShieldCheck,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    Ticket,
    ShoppingBag
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import OrderSuccessModal from "@/components/OrderSuccessModal";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const { showToast } = useToast();
    const { cart, clearCart, directCheckoutItem, clearDirectCheckout, loading: cartLoading } = useCart();

    // Determine which items to use
    const checkoutItems = useMemo(() => {
        return mode === "direct" && directCheckoutItem ? [directCheckoutItem] : cart;
    }, [mode, directCheckoutItem, cart]);

    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
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
        "Gilgit": 299,
        "Other": 299
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = useMemo(() => {
        return checkoutItems.reduce((acc, item) => {
            const itemPrice = item.onSale && item.salePrice ? item.salePrice : item.price;
            return acc + itemPrice * item.quantity;
        }, 0);
    }, [checkoutItems]);

    const shippingFee = useMemo(() => {
        if (!shippingAddress.city) return 0;
        return SHIPPING_RATES[shippingAddress.city as keyof typeof SHIPPING_RATES] || SHIPPING_RATES["Other"];
    }, [shippingAddress.city]);

    const total = subtotal + shippingFee;

    const handlePlaceOrder = async () => {
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
            showToast("Please complete your shipping information.", "error");
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

            if (mode === "direct") clearDirectCheckout();
            else clearCart();

            if (paymentMethod === "COD") {
                setIsSuccessModalOpen(true);
            } else {
                router.push(`/payment/mock?amount=${total}&orderIds=${orderIds.join(',')}&method=${paymentMethod}`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOrderPlaced && (cartLoading || checkoutItems.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Securing Checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Simple Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <ChevronLeft size={20} />
                        <span className="text-sm font-bold">Back to Store</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Checkout</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-10 overflow-x-auto py-2">
                    <div className="flex items-center gap-4 min-w-max px-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">Shipping</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200"></div>
                        <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center text-[8px] font-bold">2</div>
                            <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200"></div>
                        <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center text-[8px] font-bold">3</div>
                            <span className="text-xs font-bold uppercase tracking-wider">Review</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT: Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. SHIPPING ADDRESS */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-600" />
                                    Shipping Information
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <User size={12} /> Full Name
                                    </label>
                                    <input
                                        name="fullName"
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                                        placeholder="John Doe"
                                        value={shippingAddress.fullName}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Phone size={12} /> Phone Number
                                    </label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                                        placeholder="+92 3XX XXXXXXX"
                                        value={shippingAddress.phone}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        Address Details
                                    </label>
                                    <input
                                        name="street"
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Flat/House No, Street, Area"
                                        value={shippingAddress.street}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                                    <select
                                        name="city"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                                        value={shippingAddress.city}
                                        onChange={handleAddressChange}
                                    >
                                        <option value="">Select your city</option>
                                        {Object.keys(SHIPPING_RATES).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Postal Code</label>
                                    <input
                                        name="zipCode"
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Zip Code"
                                        value={shippingAddress.zipCode}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. PAYMENT METHODS */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={16} className="text-blue-600" />
                                    Payment Selection
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: "COD", label: "Cash on Delivery", icon: <Banknote className="text-emerald-500" />, desc: "Pay when you receive" },
                                    { id: "JazzCash", label: "JazzCash", icon: <Smartphone className="text-rose-600" />, desc: "Digital Wallet" },
                                    { id: "EasyPaisa", label: "EasyPaisa", icon: <Smartphone className="text-green-500" />, desc: "Digital Wallet" },
                                    { id: "PayPal", label: "PayPal / Credit Card", icon: <CreditCard className="text-blue-800" />, desc: "Global Payment" },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-100 ${paymentMethod === method.id
                                                ? "border-blue-600 bg-blue-50/50"
                                                : "border-gray-50 bg-gray-50/30"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`p-2 rounded-lg bg-white shadow-sm border ${paymentMethod === method.id ? "border-blue-200" : "border-gray-100"}`}>
                                            {method.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-black text-gray-900 uppercase tracking-wider">{method.label}</div>
                                            <div className="text-[10px] font-bold text-gray-400">{method.desc}</div>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={14} className="text-blue-600" />
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: Summary */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <section className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <ShoppingBag size={16} className="text-blue-600" />
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                    {checkoutItems.map((item) => {
                                        const itemPrice = item.onSale && item.salePrice ? item.salePrice : item.price;
                                        return (
                                            <div key={item._id} className="flex gap-4">
                                                <div className="relative w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden">
                                                    <Image
                                                        src={item.images?.[0] || ""}
                                                        alt={item.name}
                                                        fill
                                                        className="object-contain p-1.5"
                                                    />
                                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate">{item.name}</h4>
                                                    <div className="text-[10px] font-black text-blue-600 mt-1">₨ {itemPrice.toLocaleString()}</div>
                                                    {item.onSale && (
                                                        <span className="text-[8px] text-gray-400 line-through">₨ {item.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-black text-gray-900">
                                                    ₨ {(itemPrice * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Promo Code Box */}
                                <div className="flex gap-2 mb-6">
                                    <div className="flex-1 relative">
                                        <Ticket size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            placeholder="Promo Code"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-4 text-[10px] font-bold uppercase tracking-widest placeholder:text-gray-300 outline-none"
                                        />
                                    </div>
                                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Apply</button>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₨ {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Shipping</span>
                                        <span className={shippingFee === 0 ? "text-green-500" : ""}>
                                            {shippingFee === 0 ? "FREE" : `₨ ${shippingFee.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-dashed border-gray-100">
                                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total</span>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-blue-600">₨ {total.toLocaleString()}</span>
                                            <p className="text-[9px] font-bold text-gray-400 tracking-tight">Vat included where applicable</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Complete Order
                                            <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] font-bold text-gray-400 text-center mt-4 px-6 leading-relaxed">
                                    By placing your order, you agree to BroMart's
                                    <span className="text-blue-600"> Terms of Service </span>
                                    and <span className="text-blue-600"> Privacy Policy </span>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Loading Secure Checkout...</p>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
