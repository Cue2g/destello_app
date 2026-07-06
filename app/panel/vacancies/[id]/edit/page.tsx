import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { VacancyForm } from "../../vacancy-form"

export default async function EditVacancyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: parseInt(id) },
  })

  if (!vacancy || vacancy.clientId !== session.user.clientId!) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Panel", href: "/panel" },
          { label: "Vacantes", href: "/panel/vacancies" },
          { label: vacancy.title, href: `/panel/vacancies/${vacancy.id}` },
          { label: "Editar" },
        ]}
        backHref={`/panel/vacancies/${vacancy.id}`}
      />
      <div className="border border-base-300 bg-base-100 rounded-lg p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="icon-[tabler--briefcase] size-7" />
          </div>
          <h1 className="text-2xl font-bold">Editar vacante</h1>
          <p className="text-sm text-base-content/75 mt-1">
            {vacancy.title}
          </p>
        </div>

        <VacancyForm
          vacancy={{
            id: vacancy.id,
            title: vacancy.title,
            description: vacancy.description,
            requirements: vacancy.requirements,
            location: vacancy.location,
            modality: vacancy.modality,
            salaryMin: vacancy.salaryMin,
            salaryMax: vacancy.salaryMax,
            status: vacancy.status,
            closedAt: vacancy.closedAt?.toISOString() ?? null,
          }}
        />
      </div>
    </div>
  )
}
