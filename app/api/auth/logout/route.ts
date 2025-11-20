import { NextResponse } from "next/server"

export async function POST() {
  //o logout é feito no cliente usando signOut()
  return NextResponse.json({ message: "Logout realizado com sucesso" })
}

