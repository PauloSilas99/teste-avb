"use client"

import { useEffect, useState } from "react"
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface Cadastro {
  id: string
  nomeCadastro: string
  composicao: { nome: string }
  formato: { nome: string }
  normaTecnica: { nome: string }
  acabamento: { nome: string }
}

interface ListaMateriaisProps {
  refreshKey?: number
  onEditar?: (cadastro: Cadastro) => void
  onExcluir?: () => void
}

interface ModalConfirmacaoProps {
  isOpen: boolean
  nomeCadastro: string
  onConfirm: () => void
  onCancel: () => void
  carregando: boolean
  erro?: string
}

function ModalConfirmacao({ isOpen, nomeCadastro, onConfirm, onCancel, carregando, erro }: ModalConfirmacaoProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com sombra/fundo escuro */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
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
                Confirmar exclusão
              </h3>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja excluir o cadastro <strong className="text-gray-900">"{nomeCadastro}"</strong>?
            Esta ação não pode ser desfeita.
          </p>

          {erro && (
            <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800">{erro}</p>
            </div>
          )}

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
              {carregando ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ListaMateriais({ refreshKey, onEditar, onExcluir }: ListaMateriaisProps) {
  const [cadastros, setCadastros] = useState<Cadastro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [modalExcluir, setModalExcluir] = useState<{
    isOpen: boolean
    cadastroId: string
    nomeCadastro: string
  }>({
    isOpen: false,
    cadastroId: "",
    nomeCadastro: "",
  })
  const [excluindo, setExcluindo] = useState(false)

  const buscarCadastros = async () => {
    try {
      setCarregando(true)
      setErro("")
      const response = await fetch("/api/cadastros")
      
      if (!response.ok) {
        throw new Error("Erro ao buscar cadastros")
      }

      const data = await response.json()
      setCadastros(data.cadastros || [])
    } catch (error) {
      setErro("Erro ao carregar cadastros")
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarCadastros()
  }, [refreshKey])

  const handleAbrirModalExcluir = (e: React.MouseEvent, cadastroId: string, nomeCadastro: string) => {
    e.stopPropagation() // Impede que o clique no botão dispare o onClick do li
    setErro("") // Resetar erro ao abrir novo modal
    setModalExcluir({
      isOpen: true,
      cadastroId,
      nomeCadastro,
    })
  }

  const handleFecharModal = () => {
    if (!excluindo) {
      setModalExcluir({
        isOpen: false,
        cadastroId: "",
        nomeCadastro: "",
      })
      setErro("")
    }
  }

  const handleConfirmarExclusao = async () => {
    setExcluindo(true)
    setErro("")

    try {
      const response = await fetch(`/api/cadastros/${modalExcluir.cadastroId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao excluir cadastro")
      }

      // Fechar modal e atualizar lista após exclusão
      setModalExcluir({
        isOpen: false,
        cadastroId: "",
        nomeCadastro: "",
      })
      buscarCadastros()
      if (onExcluir) {
        onExcluir()
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir cadastro. Tente novamente.")
      console.error(error)
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Cadastros</h2>
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Cadastros</h2>
        <p className="text-red-600">{erro}</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Cadastros</h2>
        {cadastros.length === 0 ? (
          <p className="text-gray-600">Nenhum cadastro encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {cadastros.map((cadastro) => (
              <li
                key={cadastro.id}
                onClick={() => onEditar && onEditar(cadastro)}
                className="px-4 py-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <span className="text-gray-900 flex-1">{cadastro.nomeCadastro}</span>
                <button
                  onClick={(e) => handleAbrirModalExcluir(e, cadastro.id, cadastro.nomeCadastro)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Excluir cadastro"
                  type="button"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ModalConfirmacao
        isOpen={modalExcluir.isOpen}
        nomeCadastro={modalExcluir.nomeCadastro}
        onConfirm={handleConfirmarExclusao}
        onCancel={handleFecharModal}
        carregando={excluindo}
        erro={erro}
      />
    </>
  )
}
