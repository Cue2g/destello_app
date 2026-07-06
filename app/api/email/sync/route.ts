import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { syncEmails } from "@/lib/services/email-sync"

export const runtime = 'nodejs'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: "El usuario no tiene un cliente asignado" }, { status: 400 })
  }

  try {
    const result = await syncEmails(session.user.clientId)
    return NextResponse.json(result)
  } catch (err) {
    console.error("Email sync error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
