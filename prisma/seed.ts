import { hash } from "bcryptjs"
import prisma from "../lib/prisma"

const users = [
  {
    email: "admin@destello.com",
    name: "Admin",
    password: "admin123",
    role: "ADMIN" as const,
  },
]

async function main() {
  for (const user of users) {
    const passwordHash = await hash(user.password, 12)
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    })
    console.log(`Usuario creado: ${user.email}`)
  }
}

main()
