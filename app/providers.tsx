"use client"

import { SessionProvider } from "next-auth/react"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch a cada 5 minutos
      refetchOnWindowFocus={true} // Refetch quando a janela ganha foco
    >
      {children}
    </SessionProvider>
  )
}

