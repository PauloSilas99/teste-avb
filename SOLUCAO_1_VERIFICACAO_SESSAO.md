# Solução 1: Verificação de Sessão com Retry (RECOMENDADA)

## Implementação Completa

Substitua o código em `app/(auth)/login/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      const result = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      })

      if (result?.error) {
        setErro("Email ou senha incorretos")
        setCarregando(false)
      } else if (result?.ok) {
        // Login bem-sucedido - verificar se a sessão está disponível
        // Isso é especialmente importante com Neon DB que pode ter latência
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
              // Sessão confirmada - aguardar um pouco mais e redirecionar
              await new Promise(resolve => setTimeout(resolve, 300))
              window.location.href = "/dashboard"
              return
            }
          } catch (err) {
            console.error("Erro ao verificar sessão:", err)
          }
        }
        
        // Fallback: se não conseguiu verificar após todas as tentativas, redireciona mesmo assim
        if (!sessionReady) {
          console.warn("Sessão não confirmada após", maxAttempts, "tentativas, redirecionando mesmo assim...")
          window.location.href = "/dashboard"
        }
      } else {
        setErro("Erro ao fazer login. Tente novamente.")
        setCarregando(false)
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setErro("Erro ao fazer login. Tente novamente.")
      setCarregando(false)
    }
  }

  // ... resto do componente JSX permanece igual
}
```

## Por que esta solução é melhor?

1. **Verifica ativamente** se a sessão está disponível
2. **Adapta-se à latência** do Neon DB (até 4 segundos)
3. **Tem fallback** caso não consiga verificar
4. **Mais robusta** que timeout fixo

