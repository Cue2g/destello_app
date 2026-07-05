import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { TagForm } from "./tag-form"
import { TagList } from "./tag-list"

export default async function TagsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tags</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Crear tag</h2>
              <p className="text-sm text-base-content/60">
                Los tags se usan para clasificar candidatos automáticamente según el prompt de contexto.
              </p>
              <TagForm />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h2 className="card-title">Tags existentes</h2>
                <span className="badge">{tags.length}</span>
              </div>
              <TagList tags={tags} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
