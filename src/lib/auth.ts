import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export type { UserRole } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email || !senha) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: { propriedade: { select: { id: true } } },
        });
        if (!user) return null;

        const isValid = await bcryptjs.compare(senha, user.senha);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.role,
          propriedadeId: user.propriedade?.id ?? null,
        };
      },
    }),
  ],
});
