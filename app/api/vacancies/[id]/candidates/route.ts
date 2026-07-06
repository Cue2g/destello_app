import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: "El usuario no tiene un cliente asignado" }, { status: 400 })
  }

  try {
    const { id } = await params
    const vacancyId = parseInt(id)

    const vacancy = await prisma.vacancy.findFirst({
      where: { id: vacancyId, clientId: session.user.clientId },
    })
    if (!vacancy) {
      return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 })
    }

    const q = _request.nextUrl.searchParams.get("q") || ""

    const candidates = await prisma.candidate.findMany({
      where: {
        clientId: session.user.clientId,
        AND: [
          {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          {
            vacancies: { none: { vacancyId } },
          },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ candidates })
  } catch (err) {
    console.error("Search candidates error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
