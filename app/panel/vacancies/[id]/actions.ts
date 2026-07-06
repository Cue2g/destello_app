"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { deriveCandidateStatus } from "@/lib/services/derive-candidate-status"

async function verifyVacancyAccess(vacancyId: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  if (!session.user.clientId) throw new Error("No autorizado")

  const vacancy = await prisma.vacancy.findFirst({
    where: { id: vacancyId, clientId: session.user.clientId! },
  })
  if (!vacancy) throw new Error("Vacante no encontrada")
  return { session, vacancy }
}

export async function createVacancy(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  if (!session.user.clientId) throw new Error("No autorizado")

  const title = formData.get("title") as string
  if (!title?.trim()) throw new Error("El título es requerido")

  const description = formData.get("description") as string || null
  const requirements = formData.get("requirements") as string || null
  const location = formData.get("location") as string || null
  const modality = formData.get("modality") as string || null
  const salaryMin = formData.get("salaryMin") ? parseInt(formData.get("salaryMin") as string) : null
  const salaryMax = formData.get("salaryMax") ? parseInt(formData.get("salaryMax") as string) : null
  const status = (formData.get("status") as string) || "OPEN"
  const closedAt = formData.get("closedAt") as string || null

  const vacancy = await prisma.vacancy.create({
    data: {
      title: title.trim(),
      description,
      requirements,
      location,
      modality,
      salaryMin,
      salaryMax,
      status: status as any,
      closedAt: closedAt ? new Date(closedAt) : null,
      clientId: session.user.clientId!,
      createdById: parseInt(session.user.id),
    },
  })

  revalidatePath("/panel/vacancies")
  return { success: true, id: vacancy.id }
}

export async function updateVacancy(id: number, formData: FormData) {
  await verifyVacancyAccess(id)

  const title = formData.get("title") as string
  if (!title?.trim()) throw new Error("El título es requerido")

  const description = formData.get("description") as string || null
  const requirements = formData.get("requirements") as string || null
  const location = formData.get("location") as string || null
  const modality = formData.get("modality") as string || null
  const salaryMin = formData.get("salaryMin") ? parseInt(formData.get("salaryMin") as string) : null
  const salaryMax = formData.get("salaryMax") ? parseInt(formData.get("salaryMax") as string) : null
  const status = (formData.get("status") as string) || "OPEN"
  const closedAt = formData.get("closedAt") as string || null

  await prisma.vacancy.update({
    where: { id },
    data: {
      title: title.trim(),
      description,
      requirements,
      location,
      modality,
      salaryMin,
      salaryMax,
      status: status as any,
      closedAt: closedAt ? new Date(closedAt) : null,
    },
  })

  revalidatePath("/panel/vacancies")
  revalidatePath(`/panel/vacancies/${id}`)
  revalidatePath(`/panel/vacancies/${id}/edit`)
}

export async function deleteVacancy(id: number) {
  await verifyVacancyAccess(id)
  await prisma.vacancy.delete({ where: { id } })
  revalidatePath("/panel/vacancies")
}

export async function assignCandidate(vacancyId: number, candidateId: number) {
  const { session } = await verifyVacancyAccess(vacancyId)

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, clientId: session.user.clientId! },
  })
  if (!candidate) throw new Error("Candidato no encontrado")

  const existing = await prisma.candidateVacancy.findUnique({
    where: { candidateId_vacancyId: { candidateId, vacancyId } },
  })
  if (existing) throw new Error("El candidato ya está asignado a esta vacante")

  await prisma.candidateVacancy.create({
    data: {
      candidateId,
      vacancyId,
      assignedById: parseInt(session.user.id),
    },
  })

  await deriveCandidateStatus(candidateId)

  revalidatePath(`/panel/vacancies/${vacancyId}`)
  revalidatePath("/panel/vacancies")
  revalidatePath("/panel/candidates")
  revalidatePath(`/panel/candidates/${candidateId}`)
}

export async function removeCandidate(vacancyId: number, candidateId: number) {
  await verifyVacancyAccess(vacancyId)

  await prisma.candidateVacancy.delete({
    where: { candidateId_vacancyId: { candidateId, vacancyId } },
  })

  await deriveCandidateStatus(candidateId)

  revalidatePath(`/panel/vacancies/${vacancyId}`)
  revalidatePath("/panel/vacancies")
  revalidatePath("/panel/candidates")
  revalidatePath(`/panel/candidates/${candidateId}`)
}

export async function updateCandidateStage(vacancyId: number, candidateId: number, stage: string) {
  await verifyVacancyAccess(vacancyId)

  const validStages = ["NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]
  if (!validStages.includes(stage)) throw new Error("Etapa inválida")

  await prisma.candidateVacancy.update({
    where: { candidateId_vacancyId: { candidateId, vacancyId } },
    data: { stage: stage as any },
  })

  await deriveCandidateStatus(candidateId)

  revalidatePath(`/panel/vacancies/${vacancyId}`)
  revalidatePath("/panel/vacancies")
  revalidatePath("/panel/candidates")
  revalidatePath(`/panel/candidates/${candidateId}`)
}
