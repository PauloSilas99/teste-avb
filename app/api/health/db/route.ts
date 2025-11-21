import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const startTime = Date.now()
  const healthCheck = {
    status: "unknown",
    database: {
      connected: false,
      url: null as string | null,
      urlMasked: null as string | null,
      responseTime: null as number | null,
      error: null as string | null,
    },
    tests: {
      connection: false,
      query: false,
      count: null as number | null,
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  try {
    // 1. Verificar se DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      healthCheck.database.error = "DATABASE_URL not configured"
      healthCheck.database.url = null
      healthCheck.database.urlMasked = null
      return NextResponse.json(healthCheck, { status: 503 })
    }

    // Mascarar a URL para segurança (mostrar apenas host e database)
    try {
      const url = new URL(databaseUrl)
      const maskedUrl = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}${url.pathname}?***`
      healthCheck.database.urlMasked = maskedUrl
    } catch {
      healthCheck.database.urlMasked = "Invalid URL format"
    }

    healthCheck.database.url = "configured" // Não expor a URL real

    // 2. Testar conexão básica com $connect
    try {
      await prisma.$connect()
      healthCheck.tests.connection = true
      healthCheck.database.connected = true
    } catch (error: any) {
      healthCheck.database.error = `Connection failed: ${error.message}`
      healthCheck.database.responseTime = Date.now() - startTime
      return NextResponse.json(healthCheck, { status: 503 })
    }

    // 3. Testar query simples - contar usuários
    try {
      const userCount = await prisma.usuario.count()
      healthCheck.tests.query = true
      healthCheck.tests.count = userCount
    } catch (error: any) {
      healthCheck.database.error = `Query failed: ${error.message}`
      healthCheck.tests.query = false
    }

    // 4. Testar query em outra tabela para garantir que o schema está correto
    try {
      await prisma.composicao.count()
    } catch (error: any) {
      // Não é crítico, apenas log
      console.error("Secondary table query failed:", error.message)
    }

    // Calcular tempo de resposta
    healthCheck.database.responseTime = Date.now() - startTime

    // 5. Desconectar (sempre, mesmo em caso de erro)
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      // Ignorar erros de desconexão
      console.error("Error disconnecting:", disconnectError)
    }

    // Determinar status final
    if (healthCheck.tests.connection && healthCheck.tests.query) {
      healthCheck.status = "healthy"
      return NextResponse.json(healthCheck, { status: 200 })
    } else if (healthCheck.tests.connection) {
      healthCheck.status = "degraded"
      return NextResponse.json(healthCheck, { status: 200 })
    } else {
      healthCheck.status = "unhealthy"
      return NextResponse.json(healthCheck, { status: 503 })
    }

  } catch (error: any) {
    healthCheck.database.error = `Unexpected error: ${error.message}`
    healthCheck.database.responseTime = Date.now() - startTime
    healthCheck.status = "error"
    
    // Tentar desconectar em caso de erro
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar erros de desconexão
    }
    
    return NextResponse.json(healthCheck, { status: 500 })
  }
}

