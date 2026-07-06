import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { TagForm } from "./tag-form"
import { TagList } from "./tag-list"

export default async function TagsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const clientId = session.user.clientId!

  const tags = await prisma.tag.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  })

  return (
    <div className="motion-preset-fade motion-duration-500">
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Tags" }]}
        backHref="/panel"
      />
      <h1 className="text-lg font-bold tracking-tight mb-6 motion-preset-slide-up motion-duration-500">Tags</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="intersect:motion-preset-slide-left intersect:motion-opacity-in-0 motion-ease-spring-smooth lg:col-span-2">
          <div className="border border-base-300 bg-base-100 rounded-lg p-6">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-2">Crear tag</h2>
            <p className="text-xs text-base-content/70 mb-6">
              Los tags se usan para clasificar candidatos según el prompt de contexto.
            </p>
            <TagForm />
          </div>
        </div>

        <div className="intersect:motion-preset-slide-right intersect:motion-opacity-in-0 intersect:motion-delay-[200ms] motion-ease-spring-smooth lg:col-span-3">
          <div className="border border-base-300 bg-base-100 rounded-lg">
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest">Tags existentes</h2>
              <span className="badge badge-sm">{tags.length}</span>
            </div>
            <TagList tags={tags} />
          </div>
        </div>
      </div>
    </div>
  )
}
