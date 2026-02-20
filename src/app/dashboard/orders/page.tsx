import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CustomerOrdersClient from "./CustomerOrdersClient";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const userRole = (session.user as any).role;
    if (userRole !== "customer") {
        redirect("/dashboard");
    }

    return (
        <Suspense fallback={
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        }>
            <CustomerOrdersClient />
        </Suspense>
    );
}
