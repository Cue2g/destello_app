import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: "El usuario no tiene un cliente asignado" }, { status: 400 })
  }

  try {
    const q = request.nextUrl.searchParams.get("q") || ""
    const excludeCandidateId = request.nextUrl.searchParams.get("excludeCandidateId")
      ? parseInt(request.nextUrl.searchParams.get("excludeCandidateId")!)
      : undefined

    const where: Record<string, unknown> = {
      clientId: session.user.clientId,
      title: { contains: q, mode: "insensitive" },
    }

    if (excludeCandidateId) {
      where.candidates = {
        none: { candidateId: excludeCandidateId },
      }
    }

    const vacancies = await prisma.vacancy.findMany({
      where,
      select: { id: true, title: true, status: true, modality: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ vacancies })
  } catch (err) {
    console.error("Search vacancies error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
