import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Header from "@/components/layout/Header"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

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

