import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN" | "AGRICULTOR";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      propriedadeId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    propriedadeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    propriedadeId?: string | null;
  }
}
