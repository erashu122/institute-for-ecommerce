import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getPrisma } from "../db/client";

export const authConfigured = Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google" || profile?.email_verified !== true || !profile.email) return false;
      const staff = await getPrisma().staff.findUnique({ where: { email: profile.email.toLowerCase() } });
      return Boolean(staff?.active);
    },
  },
});

export async function currentStaff() {
  if (!authConfigured) return null;
  const session = await auth();
  if (!session?.user?.email) return null;
  return getPrisma().staff.findUnique({ where: { email: session.user.email.toLowerCase() } });
}
