import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null
        }

        const email = credentials.email as string
        const senha = credentials.senha as string

        try {
          const usuario = await prisma.usuario.findUnique({
            where: { email }
          })

          if (!usuario) {
            return null
          }

          const senhaValida = await bcrypt.compare(senha, usuario.senha)

          if (!senhaValida) {
            return null
          }

          return {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome
          }
        } catch (error) {
          console.error("Erro ao autenticar usuário:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.nome = user.nome
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.nome = token.nome as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
}
