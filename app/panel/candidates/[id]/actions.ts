"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function updateStatus(id: number, formData: FormData) {
  const status = formData.get("status") as string
  const validStatuses = ["NEW", "REVIEWED", "CONTACTED", "REJECTED", "HIRED"]
  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido")
  }

  await prisma.candidate.update({
    where: { id },
    data: { status: status as any },
  })

  revalidatePath(`/panel/candidates/${id}`)
  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}

export async function updateObservations(id: number, formData: FormData) {
  const observations = formData.get("observations") as string
  await prisma.candidate.update({
    where: { id },
    data: { observations },
  })

  revalidatePath(`/panel/candidates/${id}`)
  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}

export async function deleteCandidate(id: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { cvFilePath: true },
  })

  if (candidate?.cvFilePath) {
    const fullPath = path.join(process.cwd(), "public", candidate.cvFilePath)
    try {
      await fs.unlink(fullPath)
    } catch {
      // file might not exist
    }
  }

  await prisma.candidate.delete({ where: { id } })

  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}
