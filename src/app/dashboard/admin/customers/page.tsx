import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { Users, Mail, Calendar, Phone, Search, ShoppingBag, BarChart3 } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import CustomerActionsManager from "./CustomerActionsManager";
import ViewCustomerButton from "./ViewCustomerButton";
import DeleteCustomerButton from "./DeleteCustomerButton";

// Server Action
async function deleteCustomer(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    if (!userId) return;

    await dbConnect();
    await Customer.findByIdAndDelete(userId);
    revalidatePath("/dashboard/admin/customers");
}

async function getCustomers(query: string = "") {
    await dbConnect();

    const matchStage: any = { role: "customer" };
    if (query) {
        matchStage.$or = [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { phoneNumber: { $regex: query, $options: "i" } }
        ];
    }

    // Global Stats for Customers
    const [totalCustomers, verifiedCustomers, globalOrderStats] = await Promise.all([
        Customer.countDocuments({ role: "customer" }),
        Customer.countDocuments({ role: "customer", isEmailVerified: true }),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalLTV: { $sum: "$total" }
                }
            }
        ])
    ]);

    const customers = await Customer.find(matchStage).sort({ createdAt: -1 }).lean();

    // Fetch order stats for these customers
    const customerIds = customers.map((c: any) => c._id);
    const orderStats = await Order.aggregate([
        { $match: { customerId: { $in: customerIds } } },
        {
            $group: {
                _id: "$customerId",
                orderCount: { $sum: 1 },
                totalSpent: { $sum: "$total" }
            }
        }
    ]);

    const statsMapArr = orderStats.reduce((acc: any, curr: any) => {
        acc[curr._id.toString()] = {
            orderCount: curr.orderCount,
            totalSpent: curr.totalSpent
        };
        return acc;
    }, {});

    const customersWithStats = customers.map((user: any) => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        phoneNumber: user.phoneNumber || "",
        city: user.city || "",
        country: user.country || "",
        orderCount: statsMapArr[user._id.toString()]?.orderCount || 0,
        totalSpent: statsMapArr[user._id.toString()]?.totalSpent || 0,
    }));

    return {
        customers: customersWithStats,
        globalStats: {
            totalCustomers,
            verifiedCustomers,
            totalOrders: globalOrderStats[0]?.totalOrders || 0,
            totalLTV: globalOrderStats[0]?.totalLTV || 0
        }
    };
}

export default async function ManageCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q } = await searchParams;
    const query = q || "";
    const { customers, globalStats } = await getCustomers(query);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Customer Universe</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <Users size={14} className="text-blue-500" /> Identity Intelligence • Consumer Lifecycle
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <form className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search identity..."
                            className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all w-full md:w-80 text-gray-900 shadow-sm"
                        />
                    </form>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Consumers</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.totalCustomers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Verified Users</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.verifiedCustomers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Orders</p>
                            <p className="text-xl font-black text-gray-900">{globalStats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Lifetime Value</p>
                            <p className="text-xl font-black text-gray-900">₨ {globalStats.totalLTV.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <CustomerActionsManager deleteCustomerAction={deleteCustomer}>
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block w-full">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider rounded-tl-2xl w-[25%]">Customer Profile</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[20%]">Contact Channel</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[20%]">Engagement</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[10%]">Auth Status</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider w-[10%]">Registered</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-right rounded-tr-2xl w-[15%]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                                            No consumer records found
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((user: any) => (
                                        <tr key={user._id} className="group hover:bg-gray-100 transition-colors duration-200 border-b border-gray-50 last:border-0 cursor-pointer">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm border border-blue-100/50 group-hover:scale-105 transition-transform overflow-hidden relative shrink-0">
                                                        {user.image ? (
                                                            <Image src={user.image} alt={user.name} fill className="object-cover" />
                                                        ) : (
                                                            user.name?.charAt(0) || "U"
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-black text-gray-900 text-xs tracking-tight truncate block max-w-[120px]">{user.name}</span>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700">
                                                        <Phone size={9} className="text-indigo-500" />
                                                        {user.phoneNumber || "N/A"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 lowercase truncate max-w-[150px]">
                                                        <Mail size={9} />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Orders</span>
                                                        <span className="text-[10px] font-black text-gray-900 mt-0.5">{user.orderCount}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Spent</span>
                                                        <span className="text-[10px] font-black text-emerald-600 mt-0.5">₨ {(user.totalSpent || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${user.isEmailVerified
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {user.isEmailVerified ? 'Auth' : 'User'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Calendar size={10} />
                                                    <span className="text-[10px] font-bold tracking-tight">
                                                        {new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ViewCustomerButton customer={user} />
                                                    <DeleteCustomerButton customer={user} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden p-4 space-y-4 bg-gray-50/50">
                        {customers.map((user: any) => (
                            <div key={user._id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4 relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-100/50 overflow-hidden relative">
                                            {user.image ? (
                                                <Image src={user.image} alt={user.name} fill className="object-cover" />
                                            ) : (
                                                user.name?.charAt(0) || "U"
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 tracking-tight">{user.name}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.isEmailVerified ? "Verified" : "Unverified"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <ViewCustomerButton customer={user} />
                                        <DeleteCustomerButton customer={user} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Activity</span>
                                        <span className="text-xs font-black text-gray-900">{user.orderCount} Orders</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Revenue Contribution</span>
                                        <span className="text-xs font-black text-emerald-600">₨ {user.totalSpent?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Phone size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-400">{user.phoneNumber || "No Contact"}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Registered {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CustomerActionsManager>
        </div>
    );
}
