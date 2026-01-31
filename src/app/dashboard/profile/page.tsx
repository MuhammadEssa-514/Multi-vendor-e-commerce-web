import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileEditor from "@/components/ProfileEditor";
import Seller from "@/models/Seller";
import dbConnect from "@/lib/db";

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const user = session.user;

    // Fetch seller info if user is a seller
    let sellerData = null;
    if ((user as any).role === 'seller') {
        await dbConnect();
        sellerData = await Seller.findById((user as any).id);
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                        Profile Management
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Manage Your Account</h1>
                    <p className="text-gray-500 mt-2">Update your personal information, security settings, and store profile.</p>
                </div>

                <ProfileEditor userData={JSON.parse(JSON.stringify(user))} sellerData={JSON.parse(JSON.stringify(sellerData))} />

                <p className="text-center text-gray-400 text-xs mt-12 font-medium">
                    &copy; 2024 Daraz514 Project. Secure & Encrypted Connection.
                </p>
            </div>
        </div>
    );
}
