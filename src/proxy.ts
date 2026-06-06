import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/cadastro") ||
    // Arquivos do PWA precisam ser acessíveis sem login (senão não instala)
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/offline";

  if (isPublic) {
    // Já logado tentando ver login/cadastro → manda pro app
    if (
      (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) &&
      session?.user
    ) {
      return NextResponse.redirect(new URL("/inicio", req.url));
    }
    return NextResponse.next();
  }

  // Não autenticado → login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
