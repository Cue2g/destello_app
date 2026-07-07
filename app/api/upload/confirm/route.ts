import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateCandidateData, formatValidationErrors } from "@/lib/services/validate-candidate"
import { uploadFile, deleteFile, buildGcsKey } from "@/lib/gcs"

export const runtime = 'nodejs'

const ALLOWED_EXTS = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']

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

function safeJsonArray(val: string | null): unknown[] | null {
  if (!val) return null
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: "El usuario no tiene un cliente asignado" }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 })
    }

    const ext = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: "Solo se permiten archivos PDF, DOCX, PNG y JPG" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10MB" }, { status: 400 })
    }

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.name}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = getMimeType(ext)

    const gcsKey = buildGcsKey(session.user.clientId, fileName)
    const gcsUrl = await uploadFile(buffer, gcsKey, mimeType)

    const name = formData.get("name") as string | null
    const email = formData.get("email") as string | null
    const phone = formData.get("phone") as string | null
    const address = formData.get("address") as string | null
    const summary = formData.get("summary") as string | null
    const rawText = formData.get("rawText") as string | null
    const education = safeJsonArray(formData.get("education") as string | null)
    const experience = safeJsonArray(formData.get("experience") as string | null)
    const skills = safeJsonArray(formData.get("skills") as string | null)
    const courses = safeJsonArray(formData.get("courses") as string | null)

    let tagIds: number[] = []
    const tagIdsRaw = formData.get("tagIds")
    if (tagIdsRaw) {
      try {
        const parsed = JSON.parse(tagIdsRaw as string)
        if (Array.isArray(parsed)) tagIds = parsed.filter((id): id is number => typeof id === "number")
      } catch {}
    }

    const validationErrors = await validateCandidateData({ email, phone }, undefined, session.user.clientId)
    if (validationErrors.length > 0) {
      await deleteFile(gcsUrl)
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors) },
        { status: 409 },
      )
    }

    const tagConnect = tagIds.length > 0
      ? { connect: tagIds.map(id => ({ id })) }
      : undefined

    const candidate = await prisma.candidate.create({
      data: {
        name: name || null,
        email: email!.trim().toLowerCase(),
        phone: phone!,
        address: address || null,
        education: education ? JSON.stringify(education) : null,
        experience: experience ? JSON.stringify(experience) : null,
        skills: Array.isArray(skills) ? skills.map(s => String(s)) : [],
        courses: courses ? JSON.stringify(courses) : null,
        cvSummary: summary || null,
        rawText: rawText || null,
        source: "UPLOAD",
        cvFilePath: gcsUrl,
        clientId: session.user.clientId,
        uploadedById: parseInt(session.user.id),
        createdById: parseInt(session.user.id),
        tags: tagConnect,
      },
    })

    return NextResponse.json({ success: true, id: candidate.id })
  } catch (err) {
    console.error("Confirm error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
