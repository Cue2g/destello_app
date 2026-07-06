import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: "El usuario no tiene un cliente asignado" }, { status: 400 })
  }

  try {
    const id = parseInt(request.nextUrl.searchParams.get("id") || "")

    const candidate = await prisma.candidate.findFirst({
      where: { id, clientId: session.user.clientId },
    })
    if (!candidate) {
      return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 })
    }

    if (candidate.cvFilePath) {
      const filePath = path.join(process.cwd(), "public", candidate.cvFilePath)
      try {
        await fs.unlink(filePath)
      } catch {
        // file may not exist, ignore
      }
    }

    await prisma.candidate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
