import prisma from "@/lib/prisma"

export async function deriveCandidateStatus(candidateId: number) {
  const assignments = await prisma.candidateVacancy.findMany({
    where: { candidateId },
    select: { stage: true },
  })

  const stages = assignments.map((a) => a.stage)

  let status: string
  if (stages.length === 0) {
    status = "NEW"
  } else if (stages.includes("HIRED")) {
    status = "HIRED"
  } else if (stages.every((s) => s === "REJECTED")) {
    status = "REJECTED"
  } else if (stages.includes("INTERVIEW") || stages.includes("OFFER")) {
    status = "CONTACTED"
  } else {
    status = "REVIEWED"
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: status as any },
  })
}
