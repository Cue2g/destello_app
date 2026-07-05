"use server"

import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function createUser(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "ADMIN" | "VIEWER" || "VIEWER"

  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos")
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error("Ya existe un usuario con ese email")
  }

  const passwordHash = await hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role,
    },
  })
}
