import { VacancyForm } from "../vacancy-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"

export default async function NewVacancyPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Panel", href: "/panel" },
          { label: "Vacantes", href: "/panel/vacancies" },
          { label: "Nueva" },
        ]}
        backHref="/panel/vacancies"
      />
      <div className="border border-base-300 bg-base-100 rounded-lg p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="icon-[tabler--briefcase] size-7" />
          </div>
          <h1 className="text-2xl font-bold">Nueva vacante</h1>
          <p className="text-sm text-base-content/75 mt-1">
            Crea una nueva posición para asignar candidatos
          </p>
        </div>

        <VacancyForm />
      </div>
    </div>
  )
}
