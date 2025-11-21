# Solução 2: Ajustar Layout Protegido (ALTERNATIVA)

## ⚠️ Nota Importante

Server Components do Next.js não suportam `setTimeout` de forma confiável. 
**Recomendamos usar a Solução 1 (verificação de sessão) ou Solução 3 (middleware) em vez desta.**

## Alternativa: Remover verificação duplicada do layout

Se o middleware já está verificando autenticação, podemos simplificar o layout:

```typescript
// app/(protected)/layout.tsx
import { getSession } from "@/lib/auth"
import Header from "@/components/layout/Header"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sessão - o middleware já fez a verificação principal
  const session = await getSession()
  
  // Se não houver sessão, redirecionar
  // Nota: Isso é uma verificação de segurança adicional
  // O middleware já deve ter bloqueado usuários não autenticados
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

## Quando usar esta solução

- Se o middleware está funcionando corretamente
- Se você quer manter verificação dupla de segurança
- **Não use** se o problema for timing do cookie após login

## Recomendação

Prefira **Solução 1** (verificação de sessão no login) ou **Solução 3** (ajustar middleware) 
para resolver problemas de timing após login.

