import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PanelShell } from "@/components/panel-shell"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <PanelShell userName={session.user.name}>
      {children}
    </PanelShell>
  )
}
