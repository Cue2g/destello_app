import { Storage } from "@google-cloud/storage"

const bucketName = process.env.GCS_BUCKET_NAME || ""

function parsePrivateKey(raw: string): string {
  let key = raw.trim()

  if ((key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }

  key = key.replace(/\\\\n/g, "\n")
  key = key.replace(/\\n/g, "\n")
  key = key.replace(/\r\n/g, "\n")

  return key
}

function buildStorage(): Storage {
  // 1. Base64-encoded full JSON key file (immune to escape issues)
  if (process.env.GCS_KEY_JSON_BASE64) {
    const raw = Buffer.from(process.env.GCS_KEY_JSON_BASE64, "base64").toString("utf-8")
    const keyFile = JSON.parse(raw)
    return new Storage({
      projectId: keyFile.project_id,
      credentials: {
        client_email: keyFile.client_email,
        private_key: keyFile.private_key,
      },
    })
  }

  // 2. GCS_PRIVATE_KEY contains the full JSON from the Service Account key file
  const rawKey = process.env.GCS_PRIVATE_KEY || ""
  if (rawKey.trim().startsWith("{")) {
    let jsonStr = rawKey.trim()
    // strip surrounding quotes if any
    if ((jsonStr.startsWith('"') && jsonStr.endsWith('"')) ||
        (jsonStr.startsWith("'") && jsonStr.endsWith("'"))) {
      jsonStr = jsonStr.slice(1, -1)
    }
    // fix double-escaped newlines before parsing; leave \n as-is for JSON.parse
    jsonStr = jsonStr.replace(/\\\\n/g, "\\n")
    const keyFile = JSON.parse(jsonStr)
    return new Storage({
      projectId: keyFile.project_id || process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: keyFile.client_email,
        private_key: keyFile.private_key,
      },
    })
  }

  // 3. Individual env vars with escaping
  return new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL || "",
      private_key: parsePrivateKey(rawKey),
    },
  })
}

const storage = buildStorage()
const bucket = storage.bucket(bucketName)

function getKeyFromUrl(url: string): string | null {
  try {
    if (url.startsWith("http")) {
      const parsed = new URL(url)
      let path = parsed.pathname.replace(/^\//, "")
      if (bucketName && path.startsWith(bucketName + "/")) {
        path = path.slice(bucketName.length + 1)
      }
      return path ? decodeURIComponent(path) : null
    }
    if (url.startsWith("/uploads/")) {
      return decodeURIComponent(url.replace(/^\//, ""))
    }
    return null
  } catch {
    return null
  }
}

export function getFileUrl(key: string): string {
  return `https://storage.googleapis.com/${bucketName}/${key}`
}

export function buildGcsKey(clientId: number, fileName: string): string {
  return `clients/${clientId}/uploads/${fileName}`
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const file = bucket.file(key)
  await file.save(buffer, {
    contentType,
  })

  return getFileUrl(key)
}

export async function deleteFile(urlOrKey: string): Promise<void> {
  if (!urlOrKey) {
    console.warn("[deleteFile] urlOrKey vacío, se omite")
    return
  }

  let key = getKeyFromUrl(urlOrKey)
  if (!key && (urlOrKey.startsWith("clients/") || urlOrKey.startsWith("uploads/"))) {
    key = urlOrKey
  }
  if (!key) {
    console.error("[deleteFile] No se pudo extraer key de:", urlOrKey)
    throw new Error(`No se pudo extraer la key del archivo: ${urlOrKey}`)
  }

  console.log("[deleteFile] Eliminando archivo de GCS:", { bucketName, key })
  await bucket.file(key).delete({ ignoreNotFound: true })
  console.log("[deleteFile] Archivo eliminado correctamente:", key)
}
