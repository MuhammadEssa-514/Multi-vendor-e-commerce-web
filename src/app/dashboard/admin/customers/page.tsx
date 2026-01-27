import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Trash2, Users, Mail, Calendar } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";

// Server Actions
async function deleteCustomer(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    if (!userId) return;

    await dbConnect();
    await User.findByIdAndDelete(userId);
    revalidatePath("/dashboard/admin/customers");
}

async function getCustomers() {
    await dbConnect();
    // Fetch users who are ONLY customers (exclude admins and sellers)
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();

    return customers.map((user: any) => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt.toString(),
        updatedAt: user.updatedAt.toString(),
    }));
}

export default async function ManageCustomersPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const customers = await getCustomers();

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <Users className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Customers</h1>
                    <p className="text-sm text-gray-500 font-medium">Overview of all registered customers</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden relative">
                                                    {user.image ? (
                                                        <Image src={user.image} alt={user.name} fill sizes="32px" className="object-cover" />
                                                    ) : (
                                                        user.name?.charAt(0) || "U"
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${user.role === 'seller'
                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={deleteCustomer}>
                                                <input type="hidden" name="userId" value={user._id} />
                                                <button
                                                    type="submit"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
