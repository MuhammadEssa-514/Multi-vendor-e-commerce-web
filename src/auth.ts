import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "./lib/db";
import Customer from "./models/Customer";
import Seller from "./models/Seller";
import Admin from "./models/Admin";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = (credentials.email as string).toLowerCase().trim();

                // Search in all collections
                let profile = await Admin.findOne({ email }).lean();
                let roleFound = "admin";

                if (!profile) {
                    profile = await Seller.findOne({ email }).lean();
                    roleFound = "seller";
                }
                if (!profile) {
                    profile = await Customer.findOne({ email }).lean();
                    roleFound = "customer";
                }

                if (!profile) {
                    return null;
                }

                const isMatch = await bcrypt.compare(
                    credentials.password as string,
                    (profile as any).password,
                );

                if (!isMatch) {
                    return null;
                }

                return {
                    id: profile._id.toString(),
                    name: profile.name,
                    email: profile.email,
                    role: (profile as any).role || roleFound, // Use found role if field missing
                    isEmailVerified: profile.isEmailVerified,
                };
            },
        }),
    ],
});
