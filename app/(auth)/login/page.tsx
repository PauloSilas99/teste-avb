"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  // Prevenir voltar para páginas protegidas após logout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Substituir o estado atual no histórico para prevenir voltar
      window.history.replaceState(null, '', window.location.href)
    }
  }, [])

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
      } else if (result?.ok) {
        // Usar replace para não adicionar ao histórico
        router.replace("/dashboard")
      }
    } catch (error) {
      setErro("Erro ao fazer login. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Welcome Back */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-8">
        <div className="max-w-md text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Teste AVB
            </h1>
            <p className="text-lg text-blue-100">
              projeto teste para a AVB utilizado Next js com TypeScript ,Next Auth , Tailwind , Prisma e Neon Database .
            </p>
          </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-full border-2 border-white bg-transparent text-white font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Acessar Github
            </a>
        </div>
      </div>

      {/* Lado direito - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-600 mb-2">
              Fazer Login
            </h2>
            <p className="text-sm text-gray-600">
              ou use sua conta para fazer login
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Email"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Senha"
                />
              </div>
            </div>

            {erro && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {carregando ? "Entrando..." : "ENTRAR"}
            </button>
          </form>

          <div className="text-center">
            <Link href="/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Não tem uma conta? Crie uma nova conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
