import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import CustomerProfileClient from "./CustomerProfileClient";

async function getCustomerData(customerId: string) {
    await dbConnect();

    // Fetch customer
    const customer = await Customer.findById(customerId).lean();
    if (!customer) return null;

    // Fetch orders for statistics
    const orders = await Order.find({ customerId }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Get wishlist count
    const wishlistCount = customer.wishlist?.length || 0;

    return {
        customer: {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            image: customer.image || null,
            phoneNumber: customer.phoneNumber || "",
            city: customer.city || "",
            country: customer.country || "",
            isEmailVerified: customer.isEmailVerified,
            createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : new Date().toISOString(),
        },
        stats: {
            totalOrders,
            totalSpent,
            wishlistCount,
        }
    };
}

export default async function CustomerProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    // Only allow customers
    if ((session.user as any).role !== 'customer') {
        redirect("/dashboard");
    }

    const data = await getCustomerData((session.user as any).id);

    if (!data) {
        redirect("/dashboard");
    }

    return <CustomerProfileClient customerData={data.customer} stats={data.stats} />;
}
