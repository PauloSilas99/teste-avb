import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Header from "@/components/layout/Header"

// Verificação simples de sessão - o middleware já fez a verificação principal
// Esta é uma verificação de segurança adicional
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Se não houver sessão, redirecionar
  // O middleware já deve ter bloqueado, mas esta é uma camada extra de segurança
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

