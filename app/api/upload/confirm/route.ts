import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateCandidateData, formatValidationErrors } from "@/lib/services/validate-candidate"
import fs from "fs/promises"
import path from "path"

export const runtime = 'nodejs'

async function deleteUploadFile(filePath: string | null | undefined) {
  if (!filePath) return
  const fullPath = path.join(process.cwd(), "public", filePath)
  try {
    await fs.unlink(fullPath)
  } catch {
    // file might not exist
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, phone, address, education, experience, skills, courses, summary, rawText, fileName, filePath, tagIds } = body

    if (!fileName) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 })
    }

    const validationErrors = await validateCandidateData({ email, phone })
    if (validationErrors.length > 0) {
      await deleteUploadFile(filePath)
      return NextResponse.json(
        { error: formatValidationErrors(validationErrors) },
        { status: 409 }
      )
    }

    const tagConnect = Array.isArray(tagIds) && tagIds.length > 0
      ? { connect: tagIds.map((id: number) => ({ id })) }
      : undefined

    const candidate = await prisma.candidate.create({
      data: {
        name: name || null,
        email: email!.trim().toLowerCase(),
        phone: phone!,
        address: address || null,
        education: Array.isArray(education) ? JSON.stringify(education) : null,
        experience: Array.isArray(experience) ? JSON.stringify(experience) : null,
        skills: Array.isArray(skills) ? skills : [],
        courses: Array.isArray(courses) ? JSON.stringify(courses) : null,
        cvSummary: summary || null,
        rawText: rawText || null,
        source: "UPLOAD",
        cvFilePath: filePath || null,
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
