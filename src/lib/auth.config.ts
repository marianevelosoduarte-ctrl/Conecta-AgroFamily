import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export type UserRole = "ADMIN" | "AGRICULTOR";

/* ————————————————————————————————————————————
   Config edge-compatible (sem Prisma) — usada pelo middleware.
   O authorize de verdade fica em auth.ts (não roda no edge).
   ———————————————————————————————————————————— */

export const authConfig: NextAuthConfig = {
  // Necessário em hosts não-Vercel (ex: Railway): confia no host da requisição
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? "AGRICULTOR";
        token.propriedadeId = (user as { propriedadeId?: string | null }).propriedadeId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "AGRICULTOR";
        session.user.propriedadeId = (token.propriedadeId as string | null) ?? null;
      }
      return session;
    },
  },
};
