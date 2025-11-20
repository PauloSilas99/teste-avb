"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline"

// Tipos e interfaces
interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

// Componentes UI simples
const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-lg border bg-white shadow-sm w-full h-full flex flex-col ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: CardTitleProps) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = "" }: CardDescriptionProps) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
)

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 pt-0 flex-1 ${className}`}>{children}</div>
)

const CardFooter = ({ children, className = "" }: CardFooterProps) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
)

// Componente de chart simplificado
const ChartContainer = ({ children, config, className = "" }: { children: React.ReactNode; config: ChartConfig; className?: string }) => (
  <div className={`w-full h-[400px] ${className}`}>{children}</div>
)

export const description = "A pie chart with a label"

// Cores para os diferentes itens
const colors = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
]

export function PizzaGrafico() {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number; fill: string }>>([])
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function buscarEstatisticas() {
      try {
        setCarregando(true)
        setErro("")
        const response = await fetch("/api/cadastros/estatisticas")
        
        if (!response.ok) {
          throw new Error("Erro ao buscar estatísticas")
        }

        const data = await response.json()
        
        // Usar dados de acabamento para o gráfico de pizza
        const acabamentoData = Object.entries(data.acabamento || {})
          .map(([name, value], index) => ({
            name: name.length > 30 ? name.substring(0, 30) + "..." : name,
            value: value as number,
            fill: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value) // Ordenar por quantidade

        setChartData(acabamentoData)
        setTotal(data.total || 0)

        // Criar config dinâmico baseado nos dados
        const config: ChartConfig = {
          value: {
            label: "Quantidade",
          },
        }

        acabamentoData.forEach((item, index) => {
          const key = item.name.toLowerCase().replace(/\s+/g, "_")
          config[key] = {
            label: item.name,
            color: item.fill,
          }
        })

        setChartConfig(config)
      } catch (error) {
        setErro("Erro ao carregar estatísticas")
        console.error(error)
      } finally {
        setCarregando(false)
      }
    }

    buscarEstatisticas()
  }, [])

  if (carregando) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribuição por Acabamento</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (erro) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribuição por Acabamento</CardTitle>
          <CardDescription>{erro}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center h-64">
          <p className="text-red-600">{erro}</p>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribuição por Acabamento</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center h-64">
          <p className="text-gray-600">Não há cadastros para exibir</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribuição por Acabamento</CardTitle>
        <CardDescription>Mostrando distribuição por Acabamento Superficial de aço</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto pb-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-900">
                          {payload[0]?.name || ""}
                        </p>
                        <p className="text-sm text-blue-600">
                          Quantidade: {payload[0]?.value || 0}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: string) => value.length > 20 ? value.substring(0, 20) + "..." : value}
              />
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name"
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                label={({ name, percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total de {total} cadastro{total !== 1 ? "s" : ""} <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="text-gray-600 leading-none">
          Mostrando distribuição por Acabamento Superficial de aço
        </div>
      </CardFooter>
    </Card>
  )
}
