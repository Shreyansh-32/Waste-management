import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Guard: missing fields → return null, never throw
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id:           true,
              name:         true,
              email:        true,
              role:         true,
              passwordHash: true, // matches the field name used in route.ts
            },
          });

          // No user found
          if (!user || !user.passwordHash) return null;

          // Compare submitted password against the stored hash
          const valid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!valid) return null;

          // Return the shape NextAuth expects — omit passwordHash
          return {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  user.role ?? undefined,
          };
        } catch (err) {
          // Log server-side; returning null triggers an auth error, not a 500
          console.error("[authorize]", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error:  "/signin",
  },

  debug: process.env.NODE_ENV === "development",
};