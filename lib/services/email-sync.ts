import Imap from 'imap'
import { simpleParser } from 'mailparser'
import fs from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { decrypt } from './crypto'
import { parseCvFile, classifyTags } from './cv-parser'
import { validateCandidateData } from './validate-candidate'
import { normalizePhone } from './normalize-phone'

type AttachStatus = 'created' | 'duplicate' | 'error'

export interface SyncDetail {
  emailSubject: string
  from: string
  filename: string
  status: AttachStatus
  candidateId?: number
  message?: string
}

export interface SyncResult {
  processedEmails: number
  candidatesCreated: number
  duplicates: number
  errors: number
  details: SyncDetail[]
}

const LOG_PREFIX = '[EMAIL-SYNC]'

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']

function isAllowedAttachment(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  }
  return map[ext] || 'application/octet-stream'
}

function connectImap(config: {
  host: string
  port: number
  userEmail: string
  password: string
  useTls: boolean
}): Promise<Imap> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      host: config.host,
      port: config.port,
      user: config.userEmail,
      password: config.password,
      tls: config.useTls,
      tlsOptions: { rejectUnauthorized: false },
    })

    imap.once('ready', () => resolve(imap))
    imap.once('error', (err: Error) => reject(err))
    imap.connect()
  })
}

function openInbox(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function searchEmails(imap: Imap, criteria: any[]): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) reject(err)
      else resolve(results || [])
    })
  })
}

function fetchEmail(imap: Imap, uid: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fetch = imap.fetch(uid, { bodies: '' })
    let buffer = Buffer.alloc(0)

    fetch.on('message', (msg) => {
      msg.on('body', (stream: NodeJS.ReadableStream) => {
        stream.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk])
        })
      })
    })

    fetch.on('end', () => resolve(buffer))
    fetch.on('error', (err: Error) => reject(err))
  })
}

function markAsSeen(imap: Imap, uid: number): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.setFlags(uid, ['\\Seen'], (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export async function testImapConnection(config: {
  host: string
  port: number
  userEmail: string
  password: string
  useTls: boolean
}): Promise<{ ok: boolean; message: string }> {
  try {
    const imap = await connectImap(config)
    await openInbox(imap)
    imap.end()
    return { ok: true, message: 'Conexión exitosa' }
  } catch (err: any) {
    const msg = err?.source === 'timeout'
      ? 'Tiempo de espera agotado. Verifica host, puerto y TLS.'
      : err?.textual || err?.message || 'Error de conexión IMAP'
    return { ok: false, message: msg }
  }
}

export async function syncEmails(clientId: number): Promise<SyncResult> {
  const config = await prisma.emailConfig.findUnique({ where: { clientId } })
  if (!config) {
    console.log(`${LOG_PREFIX} No email config found for clientId=${clientId}`)
    return { processedEmails: 0, candidatesCreated: 0, duplicates: 0, errors: 0, details: [] }
  }

  console.log(`${LOG_PREFIX} Starting sync for clientId=${clientId}, email=${config.userEmail}, lastChecked=${config.lastChecked}`)

  const password = decrypt(config.password)
  const imap = await connectImap({
    host: config.host,
    port: config.port,
    userEmail: config.userEmail,
    password,
    useTls: config.useTls,
  })

  await openInbox(imap)

  // IMAP SINCE requires format "DD-Mon-YYYY" - we pass a Date object
  // and the imap library converts it internally
  const searchCriteria: any[] = ['UNSEEN']
  if (config.lastChecked) {
    searchCriteria.push(['SINCE', config.lastChecked])
    console.log(`${LOG_PREFIX} Search criteria: UNSEEN + SINCE ${config.lastChecked.toISOString()}`)
  } else {
    // First run: look back 7 days so we catch emails already in inbox
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    searchCriteria.push(['SINCE', sevenDaysAgo])
    console.log(`${LOG_PREFIX} Search criteria (first run): UNSEEN + SINCE ${sevenDaysAgo.toISOString()}`)
  }

  const uids = await searchEmails(imap, searchCriteria)
  console.log(`${LOG_PREFIX} Found ${uids.length} unseen email(s)`)

  const result: SyncResult = {
    processedEmails: 0,
    candidatesCreated: 0,
    duplicates: 0,
    errors: 0,
    details: [],
  }

  for (const uid of uids) {
    try {
      const raw = await fetchEmail(imap, uid)
      const parsed = await simpleParser(raw)
      const subject = parsed.subject || '(sin asunto)'
      const from = parsed.from?.text || '(remitente desconocido)'
      const attachments = parsed.attachments || []

      console.log(`${LOG_PREFIX} Processing email uid=${uid}, subject="${subject}", from="${from}", attachments=${attachments.length}`)

      const validAttachments = attachments.filter(a => {
        const name = a.filename || ''
        const ok = isAllowedAttachment(name)
        if (!ok) console.log(`${LOG_PREFIX}   Skipping attachment "${name}" (not allowed)`)
        return ok
      })

      if (validAttachments.length === 0) {
        console.log(`${LOG_PREFIX}   No valid attachments, skipping email`)
        continue
      }

      console.log(`${LOG_PREFIX}   Valid attachments: ${validAttachments.length}`)
      result.processedEmails++

      for (const attachment of validAttachments) {
        const filename = attachment.filename || 'archivo'
        const ext = path.extname(filename).toLowerCase()
        const savedName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${filename}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const filePath = path.join(uploadDir, savedName)

        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(filePath, attachment.content)

        const mimeType = getMimeType(ext)
        const relativePath = `/uploads/${savedName}`

        console.log(`${LOG_PREFIX}   Saved attachment "${filename}" -> ${relativePath}`)

        try {
          console.log(`${LOG_PREFIX}   Parsing CV...`)
          const cvData = await parseCvFile(filePath, mimeType)
          console.log(`${LOG_PREFIX}   Parsed CV: name="${cvData.name}", email="${cvData.email}", phone="${cvData.phone}"`)

          const existingTags = await prisma.tag.findMany({
            where: { clientId },
            select: { id: true, name: true, color: true, prompt: true },
          })

          const selectedTagNames = await classifyTags(
            cvData.summary,
            cvData.skills,
            existingTags,
          )

          const suggestedTagIds = existingTags
            .filter(t => selectedTagNames.some(n => n.toLowerCase() === t.name.toLowerCase()))
            .map(t => t.id)

          console.log(`${LOG_PREFIX}   Suggested tags: ${suggestedTagIds.length}`)

          const validationErrors = await validateCandidateData({
            email: cvData.email,
            phone: cvData.phone,
          }, undefined, clientId)

          if (validationErrors.length > 0) {
            await fs.unlink(filePath).catch(() => {})
            const errMsg = validationErrors.map(e =>
              e.field === 'email' && e.code === 'exists' ? 'Email duplicado' :
              e.field === 'phone' && e.code === 'exists' ? 'Teléfono duplicado' :
              `Falta ${e.field}`
            ).join(', ')

            console.log(`${LOG_PREFIX}   Validation failed: ${errMsg}`)
            result.duplicates++
            result.details.push({ emailSubject: subject, from, filename, status: 'duplicate', message: errMsg })
            continue
          }

          const observations = [
            `Recibido de: ${from}`,
            `Asunto: ${subject}`,
            `Fecha: ${parsed.date?.toISOString() || ''}`,
          ].filter(Boolean).join('\n')

          const candidate = await prisma.candidate.create({
            data: {
              name: cvData.name || null,
              email: cvData.email?.trim().toLowerCase() || from,
              phone: normalizePhone(cvData.phone) || 'email-only',
              address: cvData.address || null,
              education: Array.isArray(cvData.education) ? JSON.stringify(cvData.education) : null,
              experience: Array.isArray(cvData.experience) ? JSON.stringify(cvData.experience) : null,
              skills: Array.isArray(cvData.skills) ? cvData.skills : [],
              courses: Array.isArray(cvData.courses) ? JSON.stringify(cvData.courses) : null,
              cvSummary: cvData.summary || null,
              rawText: null,
              source: 'EMAIL',
              cvFilePath: relativePath,
              observations,
              clientId,
              uploadedById: null,
              createdById: null,
              tags: suggestedTagIds.length > 0
                ? { connect: suggestedTagIds.map(id => ({ id })) }
                : undefined,
            },
          })

          console.log(`${LOG_PREFIX}   Candidate created: id=${candidate.id}, name="${candidate.name}"`)
          result.candidatesCreated++
          result.details.push({
            emailSubject: subject,
            from,
            filename,
            status: 'created',
            candidateId: candidate.id,
          })
        } catch (err: any) {
          await fs.unlink(filePath).catch(() => {})
          console.log(`${LOG_PREFIX}   Error processing attachment: ${err.message}`)
          result.errors++
          result.details.push({
            emailSubject: subject,
            from,
            filename,
            status: 'error',
            message: err.message,
          })
        }
      }

      await markAsSeen(imap, uid)
      console.log(`${LOG_PREFIX}   Marked email uid=${uid} as seen`)
    } catch (err: any) {
      console.log(`${LOG_PREFIX}   Error fetching/parsing email uid=${uid}: ${err.message}`)
      result.errors++
      result.details.push({
        emailSubject: '(error al parsear)',
        from: '',
        filename: '',
        status: 'error',
        message: err.message,
      })
    }
  }

  await prisma.emailConfig.update({
    where: { clientId },
    data: { lastChecked: new Date() },
  })

  console.log(`${LOG_PREFIX} Sync complete: processed=${result.processedEmails}, created=${result.candidatesCreated}, dupes=${result.duplicates}, errors=${result.errors}`)

  imap.end()
  return result
}
