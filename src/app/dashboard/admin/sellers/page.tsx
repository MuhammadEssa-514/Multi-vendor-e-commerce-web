import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import User from "@/models/User";
import { Trash2, CheckCircle, XCircle, Store } from "lucide-react";
import { revalidatePath } from "next/cache";

// Server Actions
async function deleteSeller(formData: FormData) {
    "use server";
    const sellerId = formData.get("sellerId");
    if (!sellerId) return;

    await dbConnect();
    await Seller.findByIdAndDelete(sellerId);
    revalidatePath("/dashboard/admin/sellers");
}

async function getSellers() {
    await dbConnect();
    const sellers = await Seller.find({}).sort({ createdAt: -1 }).lean();

    // Populate user details manually since we are using lean()
    const sellersWithUser = await Promise.all(sellers.map(async (seller: any) => {
        const user = await User.findById(seller.userId).lean();
        return {
            ...seller,
            _id: seller._id.toString(),
            userId: seller.userId.toString(),
            createdAt: seller.createdAt.toString(),
            user: user ? { name: user.name, email: user.email } : null
        };
    }));

    return sellersWithUser;
}

export default async function ManageSellersPage() {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const sellers = await getSellers();

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                    <Store className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
                    <p className="text-sm text-gray-500 font-medium">Overview of all registered sellers</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sellers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                        No sellers found.
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller: any) => (
                                    <tr key={seller._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {seller.storeName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900">{seller.storeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-900">{seller.user?.name || "Unknown"}</p>
                                                <p className="text-gray-500 text-xs">{seller.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {seller.approved ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle size={12} /> Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(seller.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={deleteSeller}>
                                                <input type="hidden" name="sellerId" value={seller._id} />
                                                <button
                                                    type="submit"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Seller"
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
