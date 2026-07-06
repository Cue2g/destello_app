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
  const role = formData.get("role") as "ADMIN" | "CLIENT" || "CLIENT"
  const clientIdStr = formData.get("clientId") as string | null

  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos")
  }

  if (role === "CLIENT" && clientIdStr) {
    const client = await prisma.client.findUnique({ where: { id: parseInt(clientIdStr) } })
    if (!client) {
      throw new Error("El cliente seleccionado no existe")
    }
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
      clientId: role === "CLIENT" && clientIdStr ? parseInt(clientIdStr) : null,
    },
  })
}

export async function createClient(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    throw new Error("Nombre y email son requeridos")
  }

  const existing = await prisma.client.findUnique({ where: { email } })
  if (existing) {
    throw new Error("Ya existe un cliente con ese email")
  }

  const client = await prisma.client.create({
    data: { name, email },
  })

  return client
}
