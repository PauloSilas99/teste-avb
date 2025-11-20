import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Buscar cadastros do usuário com relacionamentos
    const cadastros = await prisma.cadastroAco.findMany({
      where: {
        usuarioId: session.user.id as string,
      },
      include: {
        composicao: true,
        formato: true,
        normaTecnica: true,
        acabamento: true,
      },
    })

    // Agrupar por composição
    const composicaoStats = cadastros.reduce((acc, cadastro) => {
      const nome = cadastro.composicao.nome
      acc[nome] = (acc[nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por formato
    const formatoStats = cadastros.reduce((acc, cadastro) => {
      const nome = cadastro.formato.nome
      acc[nome] = (acc[nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por norma técnica
    const normaTecnicaStats = cadastros.reduce((acc, cadastro) => {
      const nome = cadastro.normaTecnica.nome
      acc[nome] = (acc[nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por acabamento
    const acabamentoStats = cadastros.reduce((acc, cadastro) => {
      const nome = cadastro.acabamento.nome
      acc[nome] = (acc[nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      composicao: composicaoStats,
      formato: formatoStats,
      normaTecnica: normaTecnicaStats,
      acabamento: acabamentoStats,
      total: cadastros.length,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    )
  }
}

