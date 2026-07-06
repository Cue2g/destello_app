import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { UploadForm } from "./upload-form"

export default async function UploadPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="motion-preset-fade motion-duration-500">
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Subir CV" }]}
        backHref="/panel"
      />
      <div className="max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-6">
          <header className="flex flex-col items-center gap-3 motion-preset-slide-up motion-duration-500">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary motion-preset-pop motion-duration-1000 motion-delay-200">
              <span className="icon-[tabler--file-upload] size-6" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Subir CV</h1>
              <p className="text-xs text-base-content/70 mt-1">
                PDF, DOCX o imagen. Extraemos los datos automáticamente.
              </p>
            </div>
          </header>
          <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg w-full p-6">
            <UploadForm />
          </div>
        </div>
      </div>
    </div>
  )
}
