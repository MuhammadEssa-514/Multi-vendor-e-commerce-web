"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    UserCircle,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Bell,
    Heart
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "My Orders", icon: Package, href: "/dashboard/orders" },
    { name: "My Profile", icon: UserCircle, href: "/dashboard/profile" },
    { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    { name: "Wishlist", icon: Heart, href: "/dashboard/wishlist" }, // Placeholder for now
];

export default function CustomerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 hidden lg:flex flex-col shadow-sm">
            <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="text-white" size={18} />
                    </div>
                    <span className="font-black text-xl text-gray-900 tracking-tight">Daraz<span className="text-indigo-600">Pure</span></span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600"} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight size={14} className="text-white/70" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-black hover:bg-gray-100 transition mb-2"
                >
                    <ShoppingBag size={18} /> Back to Shop
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </aside>
    );
}
