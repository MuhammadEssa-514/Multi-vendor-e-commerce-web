import { auth } from "@/auth";
import Link from "next/link";
import { Lock } from "lucide-react";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";

export default async function SellerGuard({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Safety check - should be handled by middleware but good for types
    if (!session || (session.user as any).role !== "seller") {
        return null;
    }

    await dbConnect();
    const sellerProfile = await Seller.findById((session.user as any).id);

    // If no profile or not approved, show pending screen
    if (!sellerProfile || !sellerProfile.approved) {
        return (
            <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-10 w-10 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Account Pending</h1>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        {sellerProfile
                            ? `Your store "${sellerProfile.storeName}" has been registered successfully and is currently under review by our administration team.`
                            : "We couldn't find your seller profile. Please contact our support team to resolve this issue."}
                    </p>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
                            Status: Awaiting Approval
                        </div>
                        <Link
                            href="/"
                            className="block w-full py-4 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors"
                        >
                            Back to Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
