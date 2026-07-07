"use client"

import { useCallback, useEffect, useState } from "react"
import { showToast } from "@/components/toast"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"

interface EmailConfig {
  id: number
  provider: string
  host: string
  port: number
  userEmail: string
  useTls: boolean
  isActive: boolean
  lastChecked: string | null
}

interface FormFields {
  provider: string
  host: string
  port: string
  userEmail: string
  password: string
  useTls: boolean
  isActive: boolean
}

const INITIAL_FORM: FormFields = {
  provider: "CUSTOM",
  host: "",
  port: "993",
  userEmail: "",
  password: "",
  useTls: true,
  isActive: true,
}

const PROVIDER_PRESETS: Record<string, { host: string; port: number; useTls: boolean }> = {
  GMAIL: { host: "imap.gmail.com", port: 993, useTls: true },
}

export default function ConnectionsPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [form, setForm] = useState<FormFields>(INITIAL_FORM)

  useEffect(() => {
    fetch("/api/email/config")
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          const c = data.config as EmailConfig
          setConfig(c)
          setForm({
            provider: c.provider,
            host: c.host,
            port: String(c.port),
            userEmail: c.userEmail,
            useTls: c.useTls,
            isActive: c.isActive,
            password: "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleProviderChange = useCallback((value: string) => {
    setForm(prev => {
      const preset = PROVIDER_PRESETS[value]
      return preset && value !== "CUSTOM"
        ? { ...prev, provider: value, host: preset.host, port: String(preset.port), useTls: preset.useTls }
        : { ...prev, provider: value }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/email/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          host: form.host,
          port: parseInt(form.port),
          userEmail: form.userEmail,
          password: form.password,
          useTls: form.useTls,
          isActive: form.isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || "Error al guardar", "error")
        return
      }

      showToast("Configuración guardada correctamente")
      setConfig(data.config)
      setForm(prev => ({ ...prev, password: "" }))
    } catch {
      showToast("Error de conexión al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  function handleDisconnectClick() {
    openConfirm("disconnect-dialog")
  }

  async function handleDisconnectConfirm() {
    setDisconnecting(true)
    try {
      const res = await fetch("/api/email/config", { method: "DELETE" })
      if (!res.ok) {
        showToast("Error al desconectar", "error")
        return
      }
      setConfig(null)
      setForm(INITIAL_FORM)
      showToast("Cuenta desconectada")
    } catch {
      showToast("Error de conexión al desconectar", "error")
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Conexiones" }]}
          backHref="/panel"
        />
        <h1 className="text-2xl font-bold mb-8">Conexiones</h1>
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Conexiones" }]}
        backHref="/panel"
      />
      <h1 className="text-lg font-bold tracking-tight">Conexiones</h1>

      {config ? (
        // Estado y Sincronización (cuando hay config)
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-6">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
              <span className="icon-[tabler--mail-check] size-5" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-semibold">Cuenta conectada</h2>
              <p className="text-xs text-base-content/70 mt-0.5">{config.userEmail}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-base-content/75 mb-6">
            <div className="flex justify-between py-1">
              <span>Estado</span>
              <span className={`font-medium ${config.isActive ? 'text-success' : 'text-base-content/50'}`}>
                {config.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Proveedor</span>
              <span className="font-medium">{config.provider === 'GMAIL' ? 'Gmail' : 'Correo personalizado'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Última revisión</span>
              <span className="font-medium">
                {config.lastChecked
                  ? new Date(config.lastChecked).toLocaleString('es-ES')
                  : 'Nunca'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-error btn-sm w-full"
            onClick={handleDisconnectClick}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <span className="icon-[tabler--plug-off] size-4" />
            )}
            {disconnecting ? "Desconectando..." : "Desconectar cuenta"}
          </button>

          <ConfirmDialog
            id="disconnect-dialog"
            title="Desconectar cuenta"
            message="¿Seguro que quieres desconectar esta cuenta de correo? Los candidatos ya creados no se verán afectados."
            confirmText="Desconectar"
            cancelText="Cancelar"
            variant="error"
            onConfirm={handleDisconnectConfirm}
          />
        </div>
      ) : (
        // Configuración de Email (cuando no hay config)
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-6">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--mail] size-5" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-semibold">Configuración de Email</h2>
              <p className="text-xs text-base-content/70 mt-0.5">
                Configura una cuenta IMAP para recibir CVs por correo
              </p>
            </div>
            <button
              type="button"
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
              onClick={() => setShowIntro(true)}
            >
              <span className="icon-[tabler--help-circle] size-3.5" />
              ¿Cómo configurar?
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <div className="input-floating">
              <select
                id="email-provider"
                className="select"
                value={form.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
              >
                <option value="CUSTOM">Correo personalizado</option>
                <option value="GMAIL">Gmail</option>
              </select>
              <label htmlFor="email-provider" className="input-floating-label">
                Proveedor
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="input-floating">
                <input
                  id="email-host"
                  type="text"
                  className="input"
                  placeholder=""
                  value={form.host}
                  onChange={(e) => { setForm(prev => ({ ...prev, host: e.target.value })) }}
                  required
                />
                <label htmlFor="email-host" className="input-floating-label">
                  Servidor IMAP
                </label>
              </div>

              <div className="input-floating">
                <input
                  id="email-port"
                  type="number"
                  className="input"
                  placeholder=""
                  value={form.port}
                  onChange={(e) => { setForm(prev => ({ ...prev, port: e.target.value })) }}
                  required
                />
                <label htmlFor="email-port" className="input-floating-label">
                  Puerto
                </label>
              </div>
            </div>

            <div className="input-floating">
              <input
                id="email-user"
                type="email"
                className="input"
                placeholder=""
                  value={form.userEmail}
                  onChange={(e) => { setForm(prev => ({ ...prev, userEmail: e.target.value })) }}
                required
              />
              <label htmlFor="email-user" className="input-floating-label">
                Correo electrónico
              </label>
            </div>

            <div className="input-floating">
              <input
                id="email-password"
                type="password"
                className="input"
                placeholder=""
                  value={form.password}
                  onChange={(e) => { setForm(prev => ({ ...prev, password: e.target.value })) }}
                required
              />
              <label htmlFor="email-password" className="input-floating-label">
                Contraseña
              </label>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={form.useTls}
                  onChange={(e) => { setForm(prev => ({ ...prev, useTls: e.target.checked })) }}
                />
                <span className="text-xs">Usar TLS</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={form.isActive}
                  onChange={(e) => { setForm(prev => ({ ...prev, isActive: e.target.checked })) }}
                />
                <span className="text-xs">Activo</span>
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <span className="icon-[tabler--device-floppy] size-4" />
              )}
              {saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}

      {/* Modal de ayuda para configurar IMAP */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card bg-base-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body gap-6">
              <header className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="icon-[tabler--mail-question] size-7" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Conectar bandeja de correo</h2>
                  <p className="text-sm text-base-content/75 mt-1">
                    Destello puede recibir CVs automáticamente desde tu correo electrónico.
                  </p>
                </div>
              </header>

              <div className="divider my-0" />

              <div className="flex flex-col gap-4 text-sm text-base-content/80">
                <p>
                  Para conectar tu correo, necesitas una cuenta que tenga acceso <strong>IMAP</strong> habilitado.
                </p>

                <div className="bg-base-200 rounded-box p-4 flex flex-col gap-3">
                  <h3 className="font-semibold text-base-content text-sm">Para Gmail:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Activa IMAP en Ajustes de Gmail → Ver todas las configuraciones → Reenvío y correo POP/IMAP</li>
                    <li>Activa <strong>Acceso de aplicaciones menos seguras</strong> o genera una <strong>Contraseña de aplicación</strong> en <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/apppasswords</a></li>
                    <li>Usa esa contraseña aquí, no tu contraseña normal de Gmail</li>
                  </ol>
                </div>

                <div className="bg-base-200 rounded-box p-4 flex flex-col gap-3">
                  <h3 className="font-semibold text-base-content text-sm">Para otros correos (Outlook, Yahoo, propio):</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Asegúrate de que el servidor tenga IMAP habilitado</li>
                    <li>Necesitarás: servidor IMAP, puerto, tu correo y contraseña</li>
                    <li>Usualmente el puerto IMAP con TLS es <strong>993</strong></li>
                  </ol>
                </div>

                <div className="bg-base-200 rounded-box p-4 flex flex-col gap-3">
                  <h3 className="font-semibold text-base-content text-sm">¿Qué correos procesa?</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Solo procesa correos <strong>no leídos</strong> que tengan archivos adjuntos</li>
                    <li>Adjuntos soportados: <strong>PDF, DOCX, DOC, PNG, JPG</strong></li>
                    <li>Los correos procesados se marcan como leídos automáticamente</li>
                    <li>La contraseña se guarda <strong>encriptada</strong> en la base de datos</li>
                  </ul>
                </div>
              </div>

              <div className="divider my-0" />

              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowIntro(false)}
                >
                  Ahora no
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => setShowIntro(false)}
                >
                  <span className="icon-[tabler--settings] size-5" />
                  Comenzar configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
