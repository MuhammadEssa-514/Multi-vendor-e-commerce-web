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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Hide navbar on all dashboard routes (Customer & Seller) - MUST BE AFTER ALL HOOKS
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search)}`);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="flex flex-col w-full font-sans sticky top-0 z-[999]">
            {/* Main Header - White with Logo & Search */}
            <div className="bg-white py-4 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between gap-4 lg:gap-8">

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden text-gray-700 p-1"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <span className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tighter">Daraz<span className="text-blue-900">Clone</span></span>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden lg:block">
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Search in Daraz Clone"
                                    className="w-full bg-gray-100 border-none rounded-l-md px-4 py-3 text-sm focus:ring-1 focus:ring-blue-600 outline-none text-black"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-6 rounded-r-md hover:bg-orange-600 transition">
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>

                        {/* Icons: Login, Cart */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {/* Search Icon Mobile (Optional - relying on the bar below for now) */}

                            {session ? (
                                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-700 relative group cursor-pointer">
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
                                    <span className="font-medium hidden xl:block truncate max-w-[100px]">{session.user?.name}</span>
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
                                <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-black">
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

                            {/* Mobile Profile Icon (If Logged In) */}
                            {session && (
                                <Link href="/dashboard" className="lg:hidden text-gray-700 hover:text-blue-600">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                        {userImage ? (
                                            <img src={userImage} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </div>
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

                    {/* Mobile Search Bar (Visible only on Mobile) */}
                    <div className="mt-4 lg:hidden">
                        <form onSubmit={handleSearch} className="flex">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full bg-gray-100 border-none rounded-l-md px-4 py-3 text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 text-white px-5 rounded-r-md hover:bg-blue-700 transition">
                                <Search size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[2000] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl overflow-y-auto animate-slide-in-left">
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <span className="font-bold text-lg text-blue-600">DarazClone</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-red-500">
                                <span className="sr-only">Close menu</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* User Section */}
                            {session ? (
                                <div className="border border-blue-100/50 bg-blue-50/50 rounded-lg p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm">
                                        {userImage ? (
                                            <img src={userImage} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{session.user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/auth/signin" className="text-center py-2.5 rounded-md bg-blue-600 text-white font-semibold text-sm shadow-sm hover:bg-blue-700">Login</Link>
                                    <Link href="/auth/register" className="text-center py-2.5 rounded-md bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">Sign Up</Link>
                                </div>
                            )}

                            {/* Links */}
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Menu</h4>
                                <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">Home</Link>
                                <Link href="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">All Products</Link>

                                {session && (
                                    <>
                                        <div className="my-3 border-t border-gray-100"></div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Account</h4>
                                        {(session.user as any).role === "seller" ? (
                                            <>
                                                <Link href="/dashboard/seller" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">Seller Dashboard</Link>
                                                <Link href="/dashboard/seller/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">Seller Orders</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">My Dashboard</Link>
                                                <Link href="/dashboard/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">My Orders</Link>
                                            </>
                                        )}
                                        <Link href="/dashboard/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">Profile Settings</Link>
                                        <button onClick={() => signOut()} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition cursor-pointer">
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
