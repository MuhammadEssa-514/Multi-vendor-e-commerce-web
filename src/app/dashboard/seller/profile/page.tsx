import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Seller from "@/models/Seller";
import SellerProfileClient from "./SellerProfileClient";

async function getSellerData(sellerId: string) {
    await dbConnect();

    const seller = await Seller.findById(sellerId).lean();
    if (!seller) return null;

    return {
        _id: seller._id.toString(),
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
        bio: seller.bio || "",
        image: seller.image || null,
        phoneNumber: seller.phoneNumber || "",
        city: seller.city || "",
        country: seller.country || "",
        balance: seller.balance || 0,
        totalEarnings: seller.totalEarnings || 0,
        cnic: seller.cnic || "",
        createdAt: seller.createdAt ? new Date(seller.createdAt).toISOString() : new Date().toISOString(),
    };
}

export default async function SellerProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    // Only allow sellers
    if ((session.user as any).role !== 'seller') {
        redirect("/dashboard");
    }

    const sellerData = await getSellerData((session.user as any).id);

    if (!sellerData) {
        redirect("/dashboard");
    }

    return <SellerProfileClient sellerData={sellerData} />;
}
