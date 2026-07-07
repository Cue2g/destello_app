import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { UploadForm } from "./upload-form"

export default async function UploadPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Subir CV" }]}
        backHref="/panel"
      />
      <UploadForm />
    </div>
  )
}
