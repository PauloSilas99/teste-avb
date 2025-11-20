import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { DadosGrafico } from "@/components/dados/DadosGrafico"
import { PizzaGrafico } from "@/components/dados/PizzaGrafico"

export default function Grafico() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Área fixa com botão e título */}
      <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pb-0">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none ">
            <ArrowLeftIcon className="w-4 h-4" /> Voltar para o Dashboard
          </button>
        </Link>
        <div className="flex items-center gap-2 mt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Relatório de Materiais</h1>
        </div>
      </div>
      {/* Área com scroll para os gráficos */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          <div className="w-full">
            <DadosGrafico />
          </div>
          <div className="w-full">
            <PizzaGrafico />
          </div>
        </div>
      </div>
    </div>
  )
}