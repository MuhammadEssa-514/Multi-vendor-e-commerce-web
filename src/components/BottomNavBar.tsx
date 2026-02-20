"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, Heart, User, Bell } from "lucide-react";

export default function BottomNavBar() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "Overview", icon: Home, path: "/dashboard" },
        { name: "Orders", icon: Package, path: "/dashboard/orders" },
        { name: "Shopping", icon: ShoppingBag, path: "/products" },
        { name: "Wishlist", icon: Heart, path: "/dashboard/wishlist" },
        { name: "Profile", icon: User, path: "/dashboard/profile" },
        { name: "Notifications", icon: Bell, path: "/dashboard/notifications" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl shadow-gray-900/10 lg:hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        // Exact match for /dashboard, startsWith for sub-routes
                        const isActive = item.path === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname?.startsWith(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={`flex flex-col items-center justify-center py-3 transition-all duration-300 relative group ${isActive
                                    ? "text-indigo-600 scale-100"
                                    : "text-gray-400 hover:text-gray-600 scale-85 hover:scale-90"
                                    }`}
                            >
                                {/* Active Indicator Bar */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-b-full transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"
                                    }`} />

                                {/* Icon with Dynamic Size */}
                                <Icon
                                    size={isActive ? 26 : 20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className="mb-1 transition-all duration-300"
                                />

                                {/* Label */}
                                <span className={`text-[8px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-indigo-600" : "text-gray-400"
                                    }`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
