import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-base-200">
      <AdminNav userName={session.user.name} userEmail={session.user.email} />
      <main className="p-6">{children}</main>
    </div>
  )
}
