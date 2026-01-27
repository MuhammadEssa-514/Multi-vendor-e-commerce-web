"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag as ShoppingBagIcon, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, loading } = useCart();

    const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);

    const handleCheckout = () => {
        router.push("/checkout");
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Syncing your cart...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                            <ShoppingBag /> MarketPlace
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-medium text-gray-900">Your cart is empty</h2>
                        <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                        <div className="mt-6">
                            <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        <section className="lg:col-span-7">
                            <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                                {cart.map((product) => (
                                    <li key={product._id} className="flex py-6 sm:py-10">
                                        <div className="flex-shrink-0 relative">
                                            {product.images?.[0] ? (
                                                <div className="w-24 h-24 sm:w-48 sm:h-48 relative rounded-md overflow-hidden">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 640px) 96px, 192px"
                                                        className="object-center object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">No Image</div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                <div>
                                                    <div className="flex justify-between">
                                                        <h3 className="text-sm">
                                                            <Link href={`/products/${product._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                                {product.name}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="mt-1 flex text-sm">
                                                        <p className="text-gray-500">{product.category}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium text-gray-900">₨ {product.price}</p>
                                                </div>

                                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                                    <label htmlFor={`quantity-${product._id}`} className="sr-only">
                                                        Quantity, {product.name}
                                                    </label>
                                                    <select
                                                        id={`quantity-${product._id}`}
                                                        name={`quantity-${product._id}`}
                                                        className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        value={product.quantity}
                                                        onChange={(e) => updateQuantity(product._id, parseInt(e.target.value))}
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((num) => (
                                                            <option key={num} value={num}>{num}</option>
                                                        ))}
                                                    </select>

                                                    <div className="absolute top-0 right-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(product._id)}
                                                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Order Summary */}
                        <section className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5 border border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">₨ {subtotal.toLocaleString()}</dd>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900 font-black">₨ {subtotal.toLocaleString()}</dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
                                >
                                    Checkout
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
