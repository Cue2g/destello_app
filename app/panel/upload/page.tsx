import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UploadForm } from "./upload-form"

export default async function UploadPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--file-upload] size-5" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Subir CV</h1>
              <p className="text-xs text-base-content/50 mt-1">
                PDF, DOCX o imagen. Extraemos los datos automáticamente.
              </p>
            </div>
          </header>
          <div className="border border-base-300 bg-base-100 rounded-lg w-full p-6">
            <UploadForm />
          </div>
        </div>
      </div>
    </div>
  )
}
