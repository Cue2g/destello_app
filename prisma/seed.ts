import { hash } from "bcryptjs"
import prisma from "../lib/prisma"

async function main() {
  // Create default admin user (no client)
  const adminHash = await hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@destello.com" },
    update: {},
    create: {
      email: "admin@destello.com",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })
  console.log("Admin creado: admin@destello.com / admin123")

  // Create a demo client
  const client = await prisma.client.upsert({
    where: { email: "demo@destello.com" },
    update: {},
    create: {
      name: "Demo Client",
      email: "demo@destello.com",
    },
  })
  console.log(`Cliente demo creado: ${client.name}`)

  // Create a demo user for the client
  const clientHash = await hash("cliente123", 12)
  await prisma.user.upsert({
    where: { email: "cliente@destello.com" },
    update: {},
    create: {
      email: "cliente@destello.com",
      name: "Cliente Demo",
      passwordHash: clientHash,
      role: "CLIENT",
      clientId: client.id,
    },
  })
  console.log("Usuario cliente creado: cliente@destello.com / cliente123")
}

main()
