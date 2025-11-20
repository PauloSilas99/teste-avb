import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

async function test(req: NextRequest) {
  const token = await getToken({ 
    req: req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  })
  return token
}
