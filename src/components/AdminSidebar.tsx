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
    Shield,
    X
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
    { name: "Manage Sellers", icon: Store, href: "/dashboard/admin/sellers" },
    { name: "Manage Customers", icon: Users, href: "/dashboard/admin/customers" },
    { name: "Featured Products", icon: Store, href: "/dashboard/admin/featured" },
    { name: "Transactions", icon: ClipboardList, href: "/dashboard/admin/transactions" },
];

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

import { memo } from "react";

const AdminSidebar = memo(({ className, onNavigate }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <aside
            className={`w-64 bg-slate-900 text-white border-r border-slate-800 min-h-screen sticky top-0 flex-col shadow-xl flex-shrink-0 ${className || 'hidden lg:flex'}`}
            suppressHydrationWarning
        >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Shield className="text-white" size={16} />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tight block leading-none">Admin</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Panel</span>
                    </div>
                </div>
                {onNavigate && (
                    <button onClick={onNavigate} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
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
                            onClick={onNavigate}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors group ${isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight size={12} className="text-white/70" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="mb-4 px-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-slate-300">System Online</span>
                    </div>
                    <p className="text-[10px] text-slate-300 pl-5">v1.1.0 Optimized</p>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
});

AdminSidebar.displayName = "AdminSidebar";
export default AdminSidebar;
