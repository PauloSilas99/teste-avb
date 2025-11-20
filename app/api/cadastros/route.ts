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

    const cadastros = await prisma.cadastroAco.findMany({
      where: {
        usuarioId: session.user.id as string,
      },
      select: {
        id: true,
        nomeCadastro: true,
        composicao: {
          select: {
            nome: true,
          },
        },
        formato: {
          select: {
            nome: true,
          },
        },
        normaTecnica: {
          select: {
            nome: true,
          },
        },
        acabamento: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        dataCriacao: "desc",
      },
    })

    return NextResponse.json({ cadastros })
  } catch (error) {
    console.error("Erro ao buscar cadastros:", error)
    return NextResponse.json(
      { error: "Erro ao buscar cadastros" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { nome, composicao, formato, normaTecnica, acabamento } = await request.json()

    if (!nome || !composicao || !formato || !normaTecnica || !acabamento) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar ou criar os registros relacionados
    const [composicaoReg, formatoReg, normaTecnicaReg, acabamentoReg] = await Promise.all([
      prisma.composicao.upsert({
        where: { nome: composicao },
        update: {},
        create: { nome: composicao },
      }),
      prisma.formato.upsert({
        where: { nome: formato },
        update: {},
        create: { nome: formato },
      }),
      prisma.normaTecnica.upsert({
        where: { nome: normaTecnica },
        update: {},
        create: { nome: normaTecnica },
      }),
      prisma.acabamentoSuperficial.upsert({
        where: { nome: acabamento },
        update: {},
        create: { nome: acabamento },
      }),
    ])

    // Criar o cadastro
    const cadastro = await prisma.cadastroAco.create({
      data: {
        nomeCadastro: nome,
        usuarioId: session.user.id as string,
        composicaoId: composicaoReg.id,
        formatoId: formatoReg.id,
        normaTecnicaId: normaTecnicaReg.id,
        acabamentoId: acabamentoReg.id,
      },
      select: {
        id: true,
        nomeCadastro: true,
      },
    })

    return NextResponse.json(
      { message: "Cadastro criado com sucesso", cadastro },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar cadastro:", error)
    return NextResponse.json(
      { error: "Erro ao criar cadastro" },
      { status: 500 }
    )
  }
}
