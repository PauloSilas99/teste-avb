// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando o Seed...')

  // 1. COMPOSIÇÃO PRIMÁRIA
  const composicoes = [
    { nome: 'Aço Carbono Comum' },
    { nome: 'Aço Inoxidável' },
    { nome: 'Aço de Baixa Liga' },
    { nome: 'Aço Ferramenta' },
  ]
  await prisma.composicao.createMany({ data: composicoes, skipDuplicates: true })
  console.log('✓ Composições criadas')

  // 2. FORMATO FÍSICO
  const formatos = [
    { nome: 'Bobina Laminada a Quente' },
    { nome: 'Chapa Grossa' },
    { nome: 'Vergalhão' },
    { nome: 'Viga Perfil I (ou H)' },
  ]
  await prisma.formato.createMany({ data: formatos, skipDuplicates: true })
  console.log('✓ Formatos criados')

  // 3. NORMA TÉCNICA
  const normas = [
    { nome: 'ASTM A36' },
    { nome: 'NBR 7480' },
    { nome: 'SAE 1020' },
    { nome: 'EN S355' },
  ]
  await prisma.normaTecnica.createMany({ data: normas, skipDuplicates: true })
  console.log('✓ Normas técnicas criadas')

  // 4. ACABAMENTO SUPERFICIAL
  const acabamentos = [
    { nome: 'Decapado' },
    { nome: 'Galvanizado' },
    { nome: 'Polido' },
    { nome: 'Laminado a Frio' },
  ]
  await prisma.acabamentoSuperficial.createMany({ data: acabamentos, skipDuplicates: true })
  console.log('✓ Acabamentos superficiais criados')

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

