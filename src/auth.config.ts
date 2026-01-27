
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.isEmailVerified = (user as any).isEmailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role as string;
                (session.user as any).id = token.id as string;
                (session.user as any).isEmailVerified = token.isEmailVerified as boolean;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // If redirecting to dashboard after login, check user role
            if (url.startsWith(baseUrl + "/dashboard") || url === baseUrl + "/dashboard") {
                // For now, we'll handle role-based redirects in the dashboard page itself
                // This callback just allows the default behavior
                return url;
            }
            // Allow callback URLs
            if (url.startsWith(baseUrl)) return url;
            // Allow relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            return baseUrl;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout');

            if (isOnDashboard || isOnCheckout) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
