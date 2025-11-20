"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface ModalConfirmacaoLogoutProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  carregando: boolean
  nomeUsuario?: string
}

function ModalConfirmacaoLogout({ isOpen, onConfirm, onCancel, carregando, nomeUsuario }: ModalConfirmacaoLogoutProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com sombra/fundo escuro */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!carregando ? onCancel : undefined}
      />
      
      {/* Modal centralizado */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-xl m-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar saída
              </h3>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja sair da sua conta{nomeUsuario ? `, ${nomeUsuario}` : ''}?
            Você precisará fazer login novamente para acessar o sistema.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={carregando}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={carregando}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {carregando ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const router = useRouter()
  const session = useSession()
  const [modalLogout, setModalLogout] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const handleAbrirModalLogout = () => {
    setModalLogout(true)
  }

  const handleFecharModal = () => {
    if (!carregando) {
      setModalLogout(false)
    }
  }

  const handleConfirmarLogout = async () => {
    setCarregando(true)
    try {
      // Fazer logout
      await signOut({ 
        redirect: false
      })
      
      // Aguardar um pouco para garantir que o logout foi processado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirecionar usando window.location para forçar reload completo e limpar sessão
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      } else {
        router.replace("/login")
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Mesmo com erro, forçar redirecionamento para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      } else {
        router.replace("/login")
      }
    }
  }

  const nomeUsuario = (session?.data?.user as any)?.nome

  return (
    <>
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Bem-vindo, {nomeUsuario}!
          </h1>
          <button
            onClick={handleAbrirModalLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            type="button"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Modal de confirmação de logout */}
      <ModalConfirmacaoLogout
        isOpen={modalLogout}
        onConfirm={handleConfirmarLogout}
        onCancel={handleFecharModal}
        carregando={carregando}
        nomeUsuario={nomeUsuario}
      />
    </>
  )
}

