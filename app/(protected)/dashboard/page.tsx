"use client"

import { PlusIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import CadastroForm from "@/components/formulario/CadastroForm"
import ListaMateriais from "@/components/lista/ListaMateriais"
import Link from "next/link"

interface CadastroData {
  id: string
  nomeCadastro: string
  composicao: { nome: string }
  formato: { nome: string }
  normaTecnica: { nome: string }
  acabamento: { nome: string }
}

export default function Dashboard() {
  const [formulario, setFormulario] = useState(false)
  const [cadastroEdicao, setCadastroEdicao] = useState<CadastroData | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCadastroCriado = () => {
    setRefreshKey(prev => prev + 1)
    setCadastroEdicao(null)
  }

  const handleNovoCadastro = () => {
    setCadastroEdicao(null)
    setFormulario(true)
  }

  const handleEditarCadastro = (cadastro: CadastroData) => {
    setCadastroEdicao(cadastro)
    setFormulario(true)
  }

  const handleExcluirCadastro = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Área fixa com botões */}
        <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pb-0">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Projeto desenvolvido por <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Paulo Silas</a></h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none " 
            onClick={handleNovoCadastro}>
              <PlusIcon className="w-4 h-4" /> Novo Cadastro
            </button>
            <div>
            <Link href="/grafico" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none ">
              <ChartBarIcon className="w-4 h-4" /> Acessar Relatório
            </Link>
          </div>
          </div>
        </div>
        
        {/* Área com scroll apenas na lista */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-4">
          {formulario && (
            <CadastroForm 
              setFormulario={setFormulario} 
              onCadastroCriado={handleCadastroCriado}
              cadastroEdicao={cadastroEdicao}
            />
          )}
          <ListaMateriais 
            refreshKey={refreshKey} 
            onEditar={handleEditarCadastro} 
            onExcluir={handleExcluirCadastro}
          />
        </div>
      </div>
    </>
  )
}
