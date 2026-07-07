"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { CandidateStatus } from "@/app/generated/prisma/enums"
import { deleteFile } from "@/lib/gcs"

async function verifyCandidateAccess(candidateId: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  if (!session.user.clientId) throw new Error("No autorizado")

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, clientId: session.user.clientId },
  })
  if (!candidate) throw new Error("Candidato no encontrado")
  return candidate
}

export async function updateStatus(id: number, formData: FormData) {
  const status = formData.get("status") as string
  const validStatuses = ["NEW", "REVIEWED", "CONTACTED", "REJECTED", "HIRED"]
  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido")
  }

  await verifyCandidateAccess(id)

  await prisma.candidate.update({
    where: { id },
    data: { status: status as CandidateStatus },
  })

  revalidatePath(`/panel/candidates/${id}`)
  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}

export async function updateObservations(id: number, formData: FormData) {
  const observations = formData.get("observations") as string

  await verifyCandidateAccess(id)

  await prisma.candidate.update({
    where: { id },
    data: { observations },
  })

  revalidatePath(`/panel/candidates/${id}`)
  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}

export async function deleteCandidate(id: number) {
  const candidate = await verifyCandidateAccess(id)

  if (candidate.cvFilePath) {
    try {
      await deleteFile(candidate.cvFilePath)
    } catch (err) {
      console.error("[deleteCandidate] Error al eliminar archivo de GCS:", err)
      throw new Error("Error al eliminar el CV del almacenamiento. El candidato NO fue eliminado.")
    }
  }

  await prisma.candidate.delete({ where: { id } })

  revalidatePath("/panel/candidates")
  revalidatePath("/panel/upload")
}
