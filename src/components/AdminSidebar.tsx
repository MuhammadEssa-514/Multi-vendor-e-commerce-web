"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Users,
    ClipboardList,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Shield
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
    { name: "Manage Sellers", icon: Store, href: "/dashboard/admin/sellers" },
    { name: "Manage Customers", icon: Users, href: "/dashboard/admin/customers" },
    { name: "Featured Products", icon: Store, href: "/dashboard/admin/featured" },
    { name: "Transactions", icon: ClipboardList, href: "/dashboard/admin/transactions" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 min-h-screen sticky top-0 hidden lg:flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Shield className="text-white" size={20} />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tight block leading-none">Admin</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main Menu</span>
                </div>
                {menuItems.map((item) => {
                    const isActive = item.href === "/dashboard/admin"
                        ? pathname === item.href
                        : pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight size={14} className="text-white/70" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="mb-4 px-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className=" w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-300">System Online</span>
                    </div>
                    <p className="text-[10px] text-slate-300 pl-5">v1.0.0 Stable</p>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </aside>
    );
}
