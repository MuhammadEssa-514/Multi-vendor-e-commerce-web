
"use client";

import { useEffect, useState } from "react";
import { Bell, Package, Info } from "lucide-react";
import Link from "next/link";

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id }),
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition bg-white border border-gray-200 rounded-full"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => markAsRead(notif._id)}
                                    className={`p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {notif.type === "order_received" ? <Package className="text-blue-600" size={16} /> : <Info className="text-gray-400" size={16} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!notif.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>{notif.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
