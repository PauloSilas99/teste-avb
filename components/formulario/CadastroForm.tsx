"use client"

import { useState, useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface CadastroData {
  id: string
  nomeCadastro: string
  composicao: { nome: string }
  formato: { nome: string }
  normaTecnica: { nome: string }
  acabamento: { nome: string }
}

interface CadastroFormProps {
  setFormulario: (formulario: boolean) => void
  onCadastroCriado?: () => void
  cadastroEdicao?: CadastroData | null
}

export default function CadastroForm({ 
  setFormulario, 
  onCadastroCriado, 
  cadastroEdicao 
}: CadastroFormProps) {
  const isEditMode = !!cadastroEdicao
  
  const [nome, setNome] = useState(cadastroEdicao?.nomeCadastro || "")
  const [composicao, setComposicao] = useState(cadastroEdicao?.composicao.nome || "Aço Carbono Comum")
  const [formato, setFormato] = useState(cadastroEdicao?.formato.nome || "Bobina Laminada a Quente")
  const [normaTecnica, setNormaTecnica] = useState(cadastroEdicao?.normaTecnica.nome || "ASTM A36")
  const [acabamento, setAcabamento] = useState(cadastroEdicao?.acabamento.nome || "Decapado")
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  // Atualizar estados quando cadastroEdicao mudar
  useEffect(() => {
    if (cadastroEdicao) {
      setNome(cadastroEdicao.nomeCadastro)
      setComposicao(cadastroEdicao.composicao.nome)
      setFormato(cadastroEdicao.formato.nome)
      setNormaTecnica(cadastroEdicao.normaTecnica.nome)
      setAcabamento(cadastroEdicao.acabamento.nome)
    } else {
      // Resetar para valores padrão quando não estiver editando
      setNome("")
      setComposicao("Aço Carbono Comum")
      setFormato("Bobina Laminada a Quente")
      setNormaTecnica("ASTM A36")
      setAcabamento("Decapado")
    }
  }, [cadastroEdicao])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      const url = isEditMode 
        ? `/api/cadastros/${cadastroEdicao?.id}`
        : "/api/cadastros"
      
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          composicao,
          formato,
          normaTecnica,
          acabamento,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erro ao ${isEditMode ? "atualizar" : "criar"} cadastro`)
      }

      // Fechar formulário e atualizar lista
      setFormulario(false)
      if (onCadastroCriado) {
        onCadastroCriado()
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : `Erro ao ${isEditMode ? "atualizar" : "criar"} cadastro`)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com sombra/fundo escuro */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setFormulario(false)}
      />
      
      {/* Formulário centralizado */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl m-4 flex flex-col">
        {/* Header fixo */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Editar Cadastro" : "Novo Cadastro"}
          </h2>
          <button 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors" 
            type="button" 
            onClick={() => setFormulario(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {erro && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{erro}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cadastro
            </label>
            <input 
              type="text" 
              id="nome" 
              name="nome" 
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Digite o nome do cadastro"
            />
          </div>
          <div>
            <label htmlFor="composicao" className="block text-sm font-medium text-gray-700 mb-1">
              Composição
            </label>
            <select 
              id="composicao" 
              name="composicao"
              required
              value={composicao}
              onChange={(e) => setComposicao(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Aço Carbono Comum">Aço Carbono Comum</option>
              <option value="Aço Inoxidável">Aço Inoxidável</option>
              <option value="Aço de Baixa Liga">Aço de Baixa Liga</option>
              <option value="Aço Ferramenta">Aço Ferramenta</option>
            </select>
          </div>
          <div>
            <label htmlFor="formato" className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select 
              id="formato" 
              name="formato"
              required
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Bobina Laminada a Quente">Bobina Laminada a Quente</option>
              <option value="Chapa Grossa">Chapa Grossa</option>
              <option value="Vergalhão">Vergalhão</option>
              <option value="Viga Perfil I (ou H)">Viga Perfil I (ou H)</option>
            </select>
          </div>
          <div>
            <label htmlFor="normaTecnica" className="block text-sm font-medium text-gray-700 mb-1">
              Norma Técnica
            </label>
            <select 
              id="normaTecnica" 
              name="normaTecnica"
              required
              value={normaTecnica}
              onChange={(e) => setNormaTecnica(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="ASTM A36">ASTM A36</option>
              <option value="NBR 7480">NBR 7480</option>
              <option value="SAE 1020">SAE 1020</option>
              <option value="EN S355">EN S355</option>
            </select>
          </div>
          <div>
            <label htmlFor="acabamento" className="block text-sm font-medium text-gray-700 mb-1">
              Acabamento
            </label>
            <select 
              id="acabamento" 
              name="acabamento"
              required
              value={acabamento}
              onChange={(e) => setAcabamento(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Decapado">Decapado</option>
              <option value="Galvanizado">Galvanizado</option>
              <option value="Polido">Polido</option>
              <option value="Laminado a Frio">Laminado a Frio</option>
            </select>
          </div>
          <div className="pt-4">
            <button 
              className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={carregando}
            >
              {carregando 
                ? (isEditMode ? "Editando..." : "Cadastrando...") 
                : (isEditMode ? "Editar" : "Cadastrar")
              }
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}