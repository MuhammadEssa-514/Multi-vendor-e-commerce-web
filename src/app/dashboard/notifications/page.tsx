import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { Bell, Package, CheckCircle, Info, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getNotifications(userId: string) {
    await dbConnect();
    const notifications = await Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return notifications.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
        createdAt: n.createdAt.toISOString(),
    }));
}

export default async function NotificationsPage() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const notifications = await getNotifications((session.user as any).id);

    const getIcon = (type: string) => {
        switch (type) {
            case "order_status_update": return <Package className="text-blue-500" size={20} />;
            case "order_received": return <CheckCircle className="text-green-500" size={20} />;
            default: return <Info className="text-gray-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-300" size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h2>
                        <p className="text-gray-500">We'll notify you when your order status changes or there's an update.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((n: any) => (
                            <div
                                key={n._id}
                                className={`bg-white p-5 rounded-xl shadow-sm border-l-4 transition hover:shadow-md ${n.isRead ? 'border-gray-200' : 'border-blue-600'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                <Clock size={10} />
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                            {n.message}
                                        </p>
                                        {n.orderId && (
                                            <Link
                                                href={`/dashboard/orders`}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                                            >
                                                Track Order →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-gray-400 text-[10px] mt-12 uppercase font-bold tracking-[0.2em]">
                    End of Notifications
                </p>
            </div>
        </div>
    );
}
