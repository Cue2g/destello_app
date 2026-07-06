import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/services/crypto"
import { testImapConnection } from "@/lib/services/email-sync"

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const config = await prisma.emailConfig.findUnique({
    where: { userId: parseInt(session.user.id) },
  })

  if (!config) {
    return NextResponse.json({ config: null })
  }

  return NextResponse.json({
    config: {
      id: config.id,
      provider: config.provider,
      host: config.host,
      port: config.port,
      userEmail: config.userEmail,
      useTls: config.useTls,
      isActive: config.isActive,
      lastChecked: config.lastChecked?.toISOString() || null,
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { provider, host, port, userEmail, password, useTls, isActive } = body

    if (!host || !port || !userEmail || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    const portNum = parseInt(port)

    const testResult = await testImapConnection({
      host,
      port: portNum,
      userEmail,
      password,
      useTls: useTls !== false,
    })

    if (!testResult.ok) {
      return NextResponse.json({ error: testResult.message }, { status: 400 })
    }

    const encryptedPassword = encrypt(password)

    const config = await prisma.emailConfig.upsert({
      where: { userId: parseInt(session.user.id) },
      update: {
        provider: provider || 'CUSTOM',
        host,
        port: portNum,
        userEmail,
        password: encryptedPassword,
        useTls: useTls !== false,
        isActive: isActive !== false,
      },
      create: {
        userId: parseInt(session.user.id),
        provider: provider || 'CUSTOM',
        host,
        port: portNum,
        userEmail,
        password: encryptedPassword,
        useTls: useTls !== false,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        provider: config.provider,
        host: config.host,
        port: config.port,
        userEmail: config.userEmail,
        useTls: config.useTls,
        isActive: config.isActive,
        lastChecked: config.lastChecked?.toISOString() || null,
      },
    })
  } catch (err) {
    console.error("Email config error:", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  await prisma.emailConfig.deleteMany({
    where: { userId: parseInt(session.user.id) },
  })

  return NextResponse.json({ success: true })
}
