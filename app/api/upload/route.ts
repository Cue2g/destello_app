import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { parseCvFile, classifyTags } from "@/lib/services/cv-parser"
import { normalizePhone } from "@/lib/services/normalize-phone"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'

const mimeTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function getMimeType(ext: string): string {
  return mimeTypes[ext] || 'application/octet-stream'
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 })
    }

    const ext = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
    if (!['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'].includes(ext)) {
      return NextResponse.json({ error: "Solo se permiten archivos PDF, DOCX, PNG y JPG" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = getMimeType(ext)

    const parsed = await parseCvFile(buffer, mimeType)

    const existingTags = await prisma.tag.findMany({
      where: { clientId: session.user.clientId! },
      select: { id: true, name: true, color: true, prompt: true },
    })

    const selectedTagNames = await classifyTags(
      parsed.summary,
      parsed.skills,
      existingTags,
    )

    const suggestedTags = existingTags
      .filter(t => selectedTagNames.some(
        n => n.toLowerCase() === t.name.toLowerCase(),
      ))
      .map(t => ({ id: t.id, name: t.name, color: t.color }))

    return NextResponse.json({
      parsed: {
        name: parsed.name || '',
        email: parsed.email || '',
        phone: normalizePhone(parsed.phone) || '',
        address: parsed.address || '',
        education: parsed.education,
        experience: parsed.experience,
        skills: parsed.skills,
        courses: parsed.courses,
        summary: parsed.summary,
        suggestedTags,
      },
      cleanedText: JSON.stringify(parsed),
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
