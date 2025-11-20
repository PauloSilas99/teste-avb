"use client"

import { useEffect, useState } from "react"
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"

// Tipos e interfaces para os componentes de UI
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
const ChartContainer = ({ children, config }: { children: React.ReactNode; config: ChartConfig }) => (
  <div className="w-full h-[400px]">{children}</div>
)

export const description = "A mixed bar chart"

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

export function DadosGrafico() {
  const [chartData, setChartData] = useState<Array<{ name: string; quantidade: number; fill: string }>>([])
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
        
        // Usar dados de composição para o gráfico
        const composicaoData = Object.entries(data.composicao || {})
          .map(([name, quantidade], index) => ({
            name: name.length > 20 ? name.substring(0, 20) + "..." : name,
            quantidade: quantidade as number,
            fill: colors[index % colors.length],
          }))
          .sort((a, b) => b.quantidade - a.quantidade) // Ordenar por quantidade

        setChartData(composicaoData)
        setTotal(data.total || 0)

        // Criar config dinâmico baseado nos dados
        const config: ChartConfig = {
          quantidade: {
            label: "Quantidade",
          },
        }

        composicaoData.forEach((item, index) => {
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
        <CardHeader>
          <CardTitle>Distribuição por Composição</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (erro) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Distribuição por Composição</CardTitle>
          <CardDescription>{erro}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center h-64">
          <p className="text-red-600">{erro}</p>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0 && !carregando) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Distribuição por Composição</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center h-64">
          <p className="text-gray-600">Não há cadastros para exibir</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Distribuição por Composição</CardTitle>
        <CardDescription>Quantidade de cadastros por tipo de composição</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            }}
          >
            <YAxis
                dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
                width={150}
                tickFormatter={(value: string) => value}
              />
              <XAxis 
                dataKey="quantidade" 
                type="number" 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-900">
                          {payload[0]?.payload?.name || ""}
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
              <Bar 
                dataKey="quantidade" 
                radius={[0, 5, 5, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
          </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total de {total} cadastro{total !== 1 ? "s" : ""} <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando distribuição por tipo de composição de aço
        </div>
      </CardFooter>
    </Card>
  )
}
