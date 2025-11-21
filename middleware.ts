import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas
  const isPublicRoute = pathname === "/login" || pathname === "/register" || pathname.startsWith("/api/auth/")
  
  // Usar getToken que é leve e não importa toda a configuração do NextAuth
  // Deixar o getToken detectar automaticamente o nome do cookie
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const token = await getToken({ 
    req: request,
    secret: secret,
  })
  
  // Se não autenticado e tentando acessar rota protegida → redirecionar para /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    // Adicionar headers para prevenir cache e voltar ao histórico
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }

  // Se autenticado e tentando acessar /login ou /register → redirecionar para /dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Para rotas protegidas, adicionar headers de cache
  const response = NextResponse.next()
  if (!isPublicRoute && token) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, including /api/auth/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

