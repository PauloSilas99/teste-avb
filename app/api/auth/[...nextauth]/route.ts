import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const config = {
  ...authConfig,
}

export const { handlers, auth } = NextAuth(config)
export const { GET, POST } = handlers

