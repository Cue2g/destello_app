"use client"

import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function PageHeader({
  breadcrumbs,
  backHref,
}: {
  breadcrumbs: BreadcrumbItem[]
  backHref?: string
}) {
  const items: React.ReactNode[] = []

  breadcrumbs.forEach((item, i) => {
    if (i > 0) {
      items.push(
        <li key={`sep-${i}`} className="breadcrumbs-separator rtl:rotate-180">
          <span className="icon-[tabler--chevron-right]" />
        </li>,
      )
    }
    items.push(
      <li key={i}>
        {item.href ? (
          <Link href={item.href}>{item.label}</Link>
        ) : (
          <span aria-current="page">{item.label}</span>
        )}
      </li>,
    )
  })

  return (
    <div className="flex items-center gap-2 mb-6">
      {backHref && (
        <Link href={backHref} className="btn btn-ghost btn-xs shrink-0">
          <span className="icon-[tabler--arrow-left] size-4" />
        </Link>
      )}
      <div className="breadcrumbs">
        <ol>{items}</ol>
      </div>
    </div>
  )
}
