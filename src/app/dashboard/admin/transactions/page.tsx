
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Seller from "@/models/Seller";
import Product from "@/models/Product"; // Ensure models are registered
import TransactionActionsManager from "./TransactionActionsManager";
import TransactionsList from "./TransactionsList";

async function getTransactions(query: string = "", status: string = "") {
    await dbConnect();

    // Build the initial match stage
    const matchStage: any = {};

    if (status && status !== "all") {
        matchStage.status = status;
    }

    // Fetch orders with populated customer data first to filter by name/email if needed
    // However, for large datasets, we should use aggregation for efficiency.
    const orders = await Order.find(matchStage)
        .sort({ createdAt: -1 })
        .populate("customerId", "name email")
        .lean();

    // Filter by query (ID, Customer Name, Email, or Store Name)
    const filteredOrders = await Promise.all(orders.map(async (order: any) => {
        let sellerName = "Multiple Sellers";
        if (order.products && order.products.length > 0 && order.products[0].sellerId) {
            const sellerDoc = await Seller.findById(order.products[0].sellerId).lean();
            if (sellerDoc) sellerName = sellerDoc.storeName;
        }

        const customerName = order.customerId?.name || "Guest User";
        const customerEmail = order.customerId?.email || "";
        const transactionId = order._id.toString();

        // Check if query matches
        const matchesQuery = !query ||
            transactionId.toLowerCase().includes(query.toLowerCase()) ||
            customerName.toLowerCase().includes(query.toLowerCase()) ||
            customerEmail.toLowerCase().includes(query.toLowerCase()) ||
            sellerName.toLowerCase().includes(query.toLowerCase());

        if (!matchesQuery) return null;

        // Destructure to exclude raw fields that cause serialization issues
        const { customerId, ...orderData } = order;

        return {
            ...orderData,
            _id: transactionId,
            userId: customerId ? {
                _id: customerId._id.toString(),
                name: customerId.name,
                email: customerId.email
            } : null,
            products: order.products ? order.products.map((p: any) => ({
                ...p,
                _id: p._id ? p._id.toString() : undefined,
                productId: p.productId ? p.productId.toString() : undefined,
                sellerId: p.sellerId ? p.sellerId.toString() : undefined
            })) : [],
            sellerName,
            createdAt: order.createdAt.toString(),
            updatedAt: order.updatedAt.toString(),
        };
    }));

    return filteredOrders.filter((o: any) => o !== null);
}

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
        redirect("/dashboard");
    }

    const { q, status } = await searchParams;
    const query = q || "";
    const statusFilter = status || "all";

    const transactions = await getTransactions(query, statusFilter);
    const totalRevenue = transactions.reduce((acc: any, curr: any) => acc + curr.total, 0);
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <TransactionActionsManager>
            <TransactionsList
                transactions={transactions}
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                avgOrderValue={avgOrderValue}
                query={query}
                statusFilter={statusFilter}
            />
        </TransactionActionsManager>
    );
}
