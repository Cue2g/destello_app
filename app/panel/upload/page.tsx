import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UploadForm } from "./upload-form"

export default async function UploadPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body p-8 gap-8">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--file-upload] size-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Subir CV</h1>
              <p className="text-sm text-base-content/60 mt-1">
                Sube un archivo PDF, DOCX o imagen (PNG/JPG). El sistema extraerá los datos automáticamente.
              </p>
            </div>
          </header>
          <div className="divider my-0" />
          <UploadForm />
        </div>
      </div>
    </div>
  )
}
