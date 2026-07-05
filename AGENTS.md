<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:destello-ui-ux -->

### Color Palette - Destello (Sage Green)
- `primary` → `#659287` (acciones principales: botones, links)
- `secondary` → `#88BDA4` (elementos secundarios)
- `accent` → `#B1D3B9` (resaltados, hover states)
- `base-100` → `#FFFFFF` (fondo de página)
- `base-200` → `#E6F2DD` (fondo de cards, superficies secundarias)
- `base-300` → `#c8d8c0` (bordes, divisores)
- `base-content` → `#1a2e25` (texto principal)
- `neutral` → `#2d3b35` (overlays, fondos modales)
- `neutral-content` → `#f0f5ee` (texto sobre neutral)

**Estados** (estándar, no modificados): `info` azul, `success` verde, `warning` amarillo, `error` rojo.

### Theme
- Tema personalizado `destello` definido en `app/globals.css` via CSS variables sobre `:root`.
- El `<html>` tiene `data-theme="destello"`.
- No se usa el theme por defecto de FlyonUI.

<!-- BEGIN:destello-ui-ux -->
## UI/UX Guidelines - Destello

### Layout & Spacing
- **Pages**: `min-h-screen flex items-center justify-center bg-base-200 p-4`
- **Cards**: `card w-full max-w-sm bg-base-100 shadow-xl` con `card-body p-8 gap-8`
- **Max width forms**: `max-w-sm`
- **Separación entre secciones**: `gap-8` dentro de card-body
- **Separación entre elementos de formulario**: `gap-5`
- **Responsive**: contenedores centrados sin `max-w-*` que no sea `max-w-sm`

### Typography
- **Títulos principales**: `text-2xl font-bold`
- **Subtítulos**: `text-sm text-base-content/60 mt-1`
- **Botones**: texto plano sin clases de typografía extra
- **Iconos**: `icon-[tabler--{name}]` de Tabler Icons (@iconify/tailwind4)

### Cards & Containers
- **Centrado**: `flex flex-col items-center gap-3` para headers de card
- **Formularios**: `flex flex-col gap-5`
- **Divisores**: `divider my-0` entre secciones del card
- **Icono decorativo**: `flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary` conteniendo `span.icon-[tabler--{name}] size-7`

### Forms (FlyonUI)
- **Inputs**: siempre usar `input-floating` + `input-floating-label` para labels flotantes
- **Input placeholder**: dejar `placeholder=""` (el label flotante lo reemplaza)
- **Input id**: siempre incluir `id="{section}-{field}"` con el `htmlFor` correspondiente
- **Required**: incluir `required` en campos obligatorios
- **Validación**: `is-valid` / `is-invalid` para estados de validación
- **Helpers**: `helper-text` para texto de ayuda debajo del input

### Buttons (FlyonUI)
- **Acción principal**: `btn btn-primary` (full width en forms con `w-full`)
- **Acción secundaria**: `btn btn-ghost`
- **Acción destructiva**: `btn btn-error`
- **Margen superior**: `mt-1` en botones dentro de formularios

### Auth (NextAuth.js)
- **Login**: Server Action con `signIn("credentials", formData)` en el form action
- **Proxy**: proteger rutas desde `proxy.ts` excluyendo `/login` y `/api/auth`
- **Sesión**: acceder con `auth()` desde `@/auth`
- **Cerrar sesión**: `signOut()` desde `@/auth`

### Naming Conventions
- IDs de inputs: `{seccion}-{campo}` (ej: `login-email`, `login-password`)
- Componentes: PascalCase
- Utilidades: camelCase
- Archivos: kebab-case
<!-- END:destello-ui-ux -->
