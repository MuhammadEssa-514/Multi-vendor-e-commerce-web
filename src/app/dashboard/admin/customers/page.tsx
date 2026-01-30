import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { Users, Mail, Calendar, Phone, Search } from "lucide-react";
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
    await User.findByIdAndDelete(userId);
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

    const customers = await User.find(matchStage).sort({ createdAt: -1 }).lean();

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

    return customers.map((user: any) => ({
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
}

export default async function ManageCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q } = await searchParams;
    const query = q || "";
    const customers = await getCustomers(query);

    return (
        <div className="p-3">
            {/* Executive Header */}
            <div className="bg-blue-500 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl">
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manage Customers</h1>
                        <p className="text-sm text-white font-medium">Verified Identity Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search name, phone or email..."
                            className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full md:w-64 text-black"
                        />
                    </form>
                </div>
            </div>

            <CustomerActionsManager deleteCustomerAction={deleteCustomer}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:overflow-x-hidden w-full">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-blue-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Identity Profile</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Auth Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                                            No customers found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((user: any) => (
                                        <tr key={user._id} className="hover:bg-blue-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden relative border border-blue-100 flex-shrink-0">
                                                        {user.image ? (
                                                            <Image src={user.image} alt={user.name} fill sizes="32px" className="object-cover" />
                                                        ) : (
                                                            user.name?.charAt(0) || "U"
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{user.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{user.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                                                        <Phone size={10} className="text-emerald-500" />
                                                        {user.phoneNumber || "No Phone"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                        <Mail size={10} className="text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isEmailVerified
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {user.isEmailVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-bold">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
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

                    {/* Compact Card Mobile View - Hidden on Desktop */}
                    <div className="lg:hidden bg-gray-50/50 p-2.5 space-y-2.5">
                        {customers.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 text-sm italic bg-white rounded-2xl border border-gray-100 shadow-sm">
                                No customers found matching your criteria.
                            </div>
                        ) : (
                            customers.map((user: any) => (
                                <div
                                    key={user._id}
                                    className="bg-white rounded-[20px] border border-gray-100 p-3.5 shadow-sm active:scale-[0.98] transition-all duration-300 relative group overflow-hidden"
                                >
                                    <div className="relative flex items-center gap-3.5 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden relative flex-shrink-0">
                                            {user.image ? (
                                                <Image src={user.image} alt={user.name} fill sizes="40px" className="object-cover" />
                                            ) : (
                                                user.name?.charAt(0) || "U"
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-black text-gray-900 truncate tracking-tight">{user.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={`w-1 h-1 rounded-full ${user.isEmailVerified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                    {user.isEmailVerified ? "Verified Account" : "Verification Pending"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ViewCustomerButton customer={user} />
                                            <DeleteCustomerButton customer={user} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                                            <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Orders</span>
                                            <span className="text-xs font-black text-gray-900">{user.orderCount || 0}</span>
                                        </div>
                                        <div className="p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                                            <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Spent</span>
                                            <span className="text-xs font-black text-emerald-600">₨ {user.totalSpent?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={10} className="text-gray-400" />
                                            {user.phoneNumber || "No Phone"}
                                        </div>
                                        <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                            <Calendar size={10} className="text-gray-400" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CustomerActionsManager>
        </div>
    );
}
