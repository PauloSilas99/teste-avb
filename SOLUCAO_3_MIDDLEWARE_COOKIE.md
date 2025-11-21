# Solução 3: Especificar Nome do Cookie no Middleware

## Implementação

Substitua o código em `middleware.ts`:

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isPublicRoute = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/health/")
  
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  
  // Especificar explicitamente o nome do cookie do NextAuth v5
  // Isso resolve problemas de detecção automática
  const token = await getToken({ 
    req: request,
    secret: secret,
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-authjs.session-token" 
      : "authjs.session-token",
  })
  
  // Se não autenticado e tentando acessar rota protegida → redirecionar para /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

## Mudança Principal

Adicionado `cookieName` explícito no `getToken()`:
- **Desenvolvimento**: `authjs.session-token`
- **Produção**: `__Secure-authjs.session-token`

Isso garante que o middleware encontre o cookie correto do NextAuth v5.

