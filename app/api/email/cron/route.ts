import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { syncEmails } from "@/lib/services/email-sync"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const configs = await prisma.emailConfig.findMany({
    where: { isActive: true },
    select: { userId: true, userEmail: true },
  })

  const results: Array<{ userEmail: string; result: any }> = []

  for (const config of configs) {
    try {
      const result = await syncEmails(config.userId)
      results.push({ userEmail: config.userEmail, result })
    } catch (err) {
      results.push({
        userEmail: config.userEmail,
        result: { error: (err as Error).message },
      })
    }
  }

  return NextResponse.json({ processed: configs.length, results })
}
