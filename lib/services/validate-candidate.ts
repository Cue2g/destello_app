import prisma from "@/lib/prisma"
import { normalizePhone } from "./normalize-phone"

export type CandidateValidationError =
  | { field: "email"; code: "missing" | "exists" }
  | { field: "phone"; code: "missing" | "exists" }

export async function validateCandidateData(
  data: { email?: string | null; phone?: string | null },
  excludeId?: number,
  clientId?: number,
): Promise<CandidateValidationError[]> {
  const errors: CandidateValidationError[] = []

  const email = data.email?.trim().toLowerCase() || ""
  const phone = normalizePhone(data.phone)

  if (!email) {
    errors.push({ field: "email", code: "missing" })
  }

  if (!phone) {
    errors.push({ field: "phone", code: "missing" })
  }

  const baseWhere: Record<string, unknown> = clientId ? { clientId } : {}

  if (email) {
    const existingEmail = await prisma.candidate.findFirst({
      where: {
        ...baseWhere,
        email,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (existingEmail) {
      errors.push({ field: "email", code: "exists" })
    }
  }

  if (phone) {
    const existingPhone = await prisma.candidate.findFirst({
      where: {
        ...baseWhere,
        phone,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (existingPhone) {
      errors.push({ field: "phone", code: "exists" })
    }
  }

  return errors
}

export function formatValidationErrors(errors: CandidateValidationError[]): string {
  const messages: string[] = []
  for (const err of errors) {
    if (err.field === "email" && err.code === "missing") {
      messages.push("El email es obligatorio.")
    } else if (err.field === "email" && err.code === "exists") {
      messages.push("Ya existe un candidato con este email.")
    } else if (err.field === "phone" && err.code === "missing") {
      messages.push("El teléfono es obligatorio.")
    } else if (err.field === "phone" && err.code === "exists") {
      messages.push("Ya existe un candidato con este teléfono.")
    }
  }
  return messages.join(" ")
}
