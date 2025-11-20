import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

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

    // Verificar se o cadastro pertence ao usuário
    const cadastroExistente = await prisma.cadastroAco.findFirst({
      where: {
        id,
        usuarioId: session.user.id as string,
      },
    })

    if (!cadastroExistente) {
      return NextResponse.json(
        { error: "Cadastro não encontrado ou não autorizado" },
        { status: 404 }
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

    // Atualizar o cadastro
    const cadastro = await prisma.cadastroAco.update({
      where: { id },
      data: {
        nomeCadastro: nome,
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
      { message: "Cadastro atualizado com sucesso", cadastro },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao atualizar cadastro:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar cadastro" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Excluir o cadastro diretamente com validação de propriedade
    // Usando deleteMany é mais eficiente e seguro que findFirst + delete
    const resultado = await prisma.cadastroAco.deleteMany({
      where: {
        id,
        usuarioId: session.user.id as string,
      },
    })

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Cadastro não encontrado ou não autorizado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Cadastro excluído com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao excluir cadastro:", error)
    return NextResponse.json(
      { error: "Erro ao excluir cadastro" },
      { status: 500 }
    )
  }
}

