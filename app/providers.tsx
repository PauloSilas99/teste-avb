"use client"

import { SessionProvider } from "next-auth/react"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider
      refetchInterval={0} // Desabilitar refetch automático
      refetchOnWindowFocus={false} // Desabilitar refetch ao focar janela
    >
      {children}
    </SessionProvider>
  )
}

