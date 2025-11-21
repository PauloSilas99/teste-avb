# Soluções Alternativas para Problema de Login no Dashboard

## 🔍 Diagnóstico: Por que a solução atual pode não funcionar?

### Possíveis Pontos de Falha

1. **Middleware bloqueando antes do cookie estar disponível**
   - O `getToken` no middleware pode não encontrar o cookie mesmo após 1.5s
   - Problema com o nome do cookie do NextAuth v5
   - Secret não configurado corretamente

2. **Layout Protegido redirecionando de volta**
   - `getSession()` no layout pode não encontrar a sessão
   - Race condition entre cookie sendo definido e verificação

3. **Latência do Neon DB**
   - Cold start pode levar mais de 1.5s
   - Timeout de conexão com o banco

4. **Configuração do NextAuth v5**
   - Cookie não sendo definido corretamente
   - Problemas com `trustHost` ou outras configurações

---

## 🛠️ Soluções Alternativas (em ordem de robustez)

### **Solução 1: Verificação de Sessão com Retry (RECOMENDADA)**

Se o timeout fixo não funcionar, implementar verificação ativa da sessão:

```typescript
// app/(auth)/login/page.tsx
} else if (result?.ok) {
  // Verificar se a sessão está realmente disponível antes de redirecionar
  let sessionReady = false
  let attempts = 0
  const maxAttempts = 20 // 20 tentativas x 200ms = 4 segundos máximo
  
  while (!sessionReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 200))
    attempts++
    
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json()
      
      if (data && data.user) {
        sessionReady = true
        // Sessão confirmada - redirecionar
        window.location.href = "/dashboard"
        return
      }
    } catch (err) {
      console.error("Erro ao verificar sessão:", err)
    }
  }
  
  // Fallback: redireciona mesmo assim
  if (!sessionReady) {
    console.warn("Sessão não confirmada, redirecionando mesmo assim...")
    window.location.href = "/dashboard"
  }
}
```

**Vantagens:**
- ✅ Verifica ativamente se a sessão está disponível
- ✅ Adapta-se à latência do Neon DB
- ✅ Tempo máximo de 4 segundos (suficiente para cold start)
- ✅ Fallback caso não consiga verificar

---

### **Solução 2: Ajustar o Layout Protegido para ser mais tolerante**

O layout protegido pode estar redirecionando muito rapidamente. Adicionar retry:

```typescript
// app/(protected)/layout.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Header from "@/components/layout/Header"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Tentar obter a sessão com retry (útil após login)
  let session = await getSession()
  
  // Se não encontrou sessão, tentar mais uma vez após pequeno delay
  // Isso ajuda com race conditions após login
  if (!session) {
    await new Promise(resolve => setTimeout(resolve, 100))
    session = await getSession()
  }
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

**Vantagens:**
- ✅ Dá uma segunda chance para a sessão ser encontrada
- ✅ Resolve race conditions após login
- ✅ Não afeta performance significativamente

---

### **Solução 3: Especificar o nome do cookie no Middleware**

NextAuth v5 pode usar nomes de cookie diferentes. Especificar explicitamente:

```typescript
// middleware.ts
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
  const token = await getToken({ 
    req: request,
    secret: secret,
    // NextAuth v5 usa estes nomes de cookie
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-authjs.session-token" 
      : "authjs.session-token",
  })
  
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

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

**Vantagens:**
- ✅ Garante que o middleware encontre o cookie correto
- ✅ Funciona tanto em dev quanto em produção
- ✅ Resolve problemas de detecção automática do nome do cookie

---

### **Solução 4: Adicionar configuração de cookie no NextAuth**

Garantir que o cookie seja definido corretamente:

```typescript
// lib/auth.config.ts
export const authConfig: NextAuthConfig = {
  providers: [
    // ... providers existentes
  ],
  session: {
    strategy: "jwt" as const,
    // Adicionar configuração de cookie
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    // ... callbacks existentes
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  // Adicionar configuração explícita de cookies
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-authjs.session-token" 
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
```

**Vantagens:**
- ✅ Controle total sobre como o cookie é definido
- ✅ Garante que o cookie seja acessível
- ✅ Configuração explícita evita problemas de detecção

---

### **Solução 5: Usar redirect: true com callbackUrl (MAIS SIMPLES)**

Deixar o NextAuth gerenciar tudo:

```typescript
// app/(auth)/login/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setErro("")
  setCarregando(true)

  try {
    // Deixar o NextAuth gerenciar o redirecionamento completamente
    const result = await signIn("credentials", {
      email,
      senha,
      redirect: true, // NextAuth gerencia tudo
      callbackUrl: "/dashboard",
    }) as { error?: string } | void

    // Se houver erro, result terá a propriedade error
    if (result && "error" in result) {
      setErro("Email ou senha incorretos")
      setCarregando(false)
    }
    // Se não houver erro, NextAuth redireciona automaticamente
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    setErro("Erro ao fazer login. Tente novamente.")
    setCarregando(false)
  }
}
```

**Vantagens:**
- ✅ Mais simples - NextAuth cuida de tudo
- ✅ Garante que o cookie seja definido antes de redirecionar
- ✅ Menos código = menos bugs

**Desvantagens:**
- ❌ Menos controle sobre o timing
- ❌ Pode não resolver problemas de latência do Neon DB

---

### **Solução 6: Adicionar timeout no Prisma para Neon DB**

Se o problema for latência do Neon DB:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Adicionar configuração de connection pool para Neon
if (process.env.DATABASE_URL?.includes('neon')) {
  // Neon DB pode ter cold start, aumentar timeout
  prisma.$connect().catch(console.error)
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

E adicionar na URL do banco (no .env):
```
DATABASE_URL="postgresql://...?connect_timeout=10&pool_timeout=10"
```

---

### **Solução 7: Combinar múltiplas abordagens (MAIS ROBUSTA)**

Implementar várias camadas de proteção:

```typescript
// app/(auth)/login/page.tsx
} else if (result?.ok) {
  // 1. Aguardar tempo inicial
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 2. Verificar sessão com retry
  let sessionReady = false
  let attempts = 0
  const maxAttempts = 15
  
  while (!sessionReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 200))
    attempts++
    
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json()
      
      if (data && data.user) {
        sessionReady = true
        // Aguardar mais um pouco para garantir
        await new Promise(resolve => setTimeout(resolve, 300))
        window.location.href = "/dashboard"
        return
      }
    } catch (err) {
      console.error("Erro ao verificar sessão:", err)
    }
  }
  
  // 3. Fallback: redireciona mesmo assim
  window.location.href = "/dashboard"
}
```

---

## 🎯 Ordem Recomendada de Implementação

1. **Primeiro**: Tentar Solução 1 (verificação de sessão com retry)
2. **Se não funcionar**: Adicionar Solução 3 (especificar nome do cookie no middleware)
3. **Se ainda não funcionar**: Implementar Solução 2 (ajustar layout protegido)
4. **Último recurso**: Solução 7 (combinar múltiplas abordagens)

## 🔧 Verificações Adicionais

Antes de implementar soluções complexas, verificar:

1. **Variáveis de ambiente**:
   - `AUTH_SECRET` ou `NEXTAUTH_SECRET` está configurado?
   - `NEXTAUTH_URL` está correto em produção?

2. **Console do navegador**:
   - Há erros de CORS?
   - O cookie está sendo definido?
   - Qual é o nome do cookie sendo usado?

3. **Network tab**:
   - A requisição para `/api/auth/session` retorna a sessão?
   - Há erros 401 ou 403?

4. **Logs do servidor**:
   - Há erros de conexão com o Neon DB?
   - O `authorize` está sendo chamado corretamente?

## 📝 Nota sobre Neon DB

O Neon DB pode ter:
- **Cold start**: Primeira conexão pode levar 2-5 segundos
- **Latência de rede**: Dependendo da região
- **Connection pooling**: Pode precisar de configuração adicional

Considerar aumentar o timeout no login para até 3-4 segundos se o problema persistir.

