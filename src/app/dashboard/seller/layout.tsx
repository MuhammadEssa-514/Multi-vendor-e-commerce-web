import { auth } from "@/auth";
import SellerGuard from "./Guard";
import SellerLayoutClient from "./SellerLayoutClient";

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <SellerGuard>
            <SellerLayoutClient session={session}>
                {children}
            </SellerLayoutClient>
        </SellerGuard>
    );
}
