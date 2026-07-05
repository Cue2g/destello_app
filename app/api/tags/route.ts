import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { name, color, prompt } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const existing = await prisma.tag.findUnique({ where: { name: name.trim() } })
    if (existing) {
      return NextResponse.json({ error: "Ya existe un tag con ese nombre" }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || "#3b82f6",
        prompt: prompt || null,
      },
    })

    return NextResponse.json({ success: true, id: tag.id })
  } catch (err) {
    console.error("Tag create error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id, name, color, prompt } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name?.trim(),
        color,
        prompt: prompt !== undefined ? prompt : undefined,
      },
    })

    return NextResponse.json({ success: true, id: tag.id })
  } catch (err) {
    console.error("Tag update error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = parseInt(request.nextUrl.searchParams.get("id") || "")

    await prisma.tag.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Tag delete error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
