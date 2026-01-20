"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Heart, Menu, ChevronDown, Phone, HelpCircle, Bell } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [search, setSearch] = useState("");
    const { cartCount } = useCart();
    const [userImage, setUserImage] = useState<string | null>(null);

    // Fetch latest user image on mount
    useEffect(() => {
        if (session?.user) {
            fetch("/api/user/profile")
                .then(res => res.json())
                .then(data => {
                    if (data.user?.image) setUserImage(data.user.image);
                })
                .catch(err => console.error("Error fetching nav avatar:", err));
        }
    }, [session]);

    // Hide navbar on all dashboard routes (Customer & Seller) - MUST BE AFTER ALL HOOKS
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search)}`);
        }
    };

    return (
        <div className="flex flex-col w-full font-sans">
            {/* Main Header - White with Logo & Search */}
            <div className="bg-white py-4 sticky top-0 z-[100] shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <span className="text-3xl font-bold text-blue-600 tracking-tighter">Daraz<span className="text-blue-900">Clone</span></span>
                    </Link>

                    {/* Search Bar - Big and Central */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Search in Daraz Clone"
                                className="w-full bg-gray-100 border-none rounded-l-md px-4 py-3 text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 text-white px-6 rounded-r-md hover:bg-orange-600 transition">
                                <Search size={20} />
                            </button>
                        </div>
                    </form>

                    {/* Icons: Login, Cart */}
                    <div className="flex items-center gap-6">
                        {session ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 relative group cursor-pointer">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                    {userImage ? (
                                        <img
                                            src={userImage}
                                            alt={session?.user?.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium hidden sm:block truncate max-w-[100px]">{session.user?.name}</span>
                                <ChevronDown size={14} className="text-gray-400" />

                                {/* Dropdown */}
                                <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block z-50">
                                    <div className="bg-white shadow-xl rounded-md border border-gray-100 py-2">
                                        {(session.user as any).role === "seller" ? (
                                            <>
                                                <Link href="/dashboard/seller" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-bold">Manage Shop</Link>
                                                <Link href="/dashboard/seller/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">My Orders</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-bold">My Dashboard</Link>
                                                <Link href="/dashboard/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">My Orders</Link>
                                            </>
                                        )}
                                        <Link href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Edit Profile</Link>
                                        <Link href="/dashboard/notifications" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Notifications</Link>
                                        <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 border-t border-gray-50 mt-1">Logout</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <Link href="/auth/signin" className="hover:text-blue-600 transition">Login</Link>
                                <span className="text-gray-300">|</span>
                                <Link href="/auth/register" className="hover:text-blue-600 transition">Sign Up</Link>
                            </div>
                        )}

                        {(!session || (session.user as any).role === "customer") && (
                            <Link href="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm px-1 box-content">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {session && (
                            <Link href="/dashboard/notifications" className="relative text-gray-700 hover:text-blue-600 transition hidden sm:block">
                                <Bell size={24} />
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
