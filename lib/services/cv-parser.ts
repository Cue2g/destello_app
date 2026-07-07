import { GoogleGenAI } from '@google/genai'

export interface Experience {
  title: string
  company: string
  period: string
  description: string
}

export interface Education {
  degree: string
  institution: string
  year: string
}

export interface Course {
  name: string
  institution: string
  year: string
}

export interface CvParseResult {
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  education: Education[]
  experience: Experience[]
  skills: string[]
  courses: Course[]
  summary: string
}

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

function getClient() {
  return client
}

const MODEL = 'gemini-3.5-flash'

const SYSTEM_PROMPT = `Eres un parser de CVs. Extrae TODA la información del CV.

REGLAS:
- name: Nombre completo en Title Case (ej: "Rebeca Moujalli"). NO incluyas descripciones en ALL CAPS, encabezados de sección, títulos de puesto, emails o teléfonos.
- email: email del candidato.
- phone: número de teléfono.
- address: dirección o ubicación.
- experience: Cada entrada es UN TRABAJO. Agrupa por rango de fechas. Incluye empresa, cargo, período y descripción. NO incluyas encabezados de sección ni datos de contacto.
- education: Cada entrada es UN TÍTULO/GRADO con institución y año.
- skills: Solo habilidades reales (software, herramientas, idiomas). NO incluyas emails, teléfonos, direcciones.
- courses: Cada entrada es UN CURSO o certificación.
- summary: Resumen de 2-3 oraciones del perfil del candidato.`

const CV_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    address: { type: 'string' },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          year: { type: 'string' },
        },
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          period: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    skills: { type: 'array', items: { type: 'string' } },
    courses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          institution: { type: 'string' },
          year: { type: 'string' },
        },
      },
    },
    summary: { type: 'string' },
  },
}

export async function parseCvFile(buffer: Buffer, mimeType: string): Promise<CvParseResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set')
  }

  const base64 = buffer.toString('base64')

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: [
      { role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }] },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseJsonSchema: CV_SCHEMA,
    },
  })

  const text = response.text
  if (!text) throw new Error('Empty response from Gemini')

  const parsed = JSON.parse(text)

  return {
    name: parsed.name || null,
    email: parsed.email || null,
    phone: parsed.phone || null,
    address: parsed.address || null,
    education: Array.isArray(parsed.education) ? parsed.education : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    courses: Array.isArray(parsed.courses) ? parsed.courses : [],
    summary: parsed.summary || '',
  }
}

const TAGS_SYSTEM_PROMPT = `Eres un clasificador de perfiles. Dado un resumen de CV y una lista de tags, decide SI o NO para cada tag según si el perfil coincide.

Devuelve un objeto decisions donde las keys son los nombres de los tags y los values son "YES" o "NO".
Sé inclusivo: responde YES si hay aunque sea una coincidencia parcial.`

export async function classifyTags(
  summary: string,
  skills: string[],
  existingTags: { name: string; color: string; prompt: string | null }[],
): Promise<string[]> {
  if (existingTags.length === 0 || !process.env.GEMINI_API_KEY) {
    return []
  }

  const tagsBlock = existingTags
    .map((t, i) => `Tag ${i + 1}: "${t.name}" - "${t.prompt || '(sin descripción)'}"`)
    .join('\n')

  const userPrompt = `Perfil del candidato:\n${summary}\n\nHabilidades: ${skills.join(', ')}\n\nEvalúa estos tags:\n${tagsBlock}\n\n¿Cuáles aplican?`

  try {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: [userPrompt],
      config: {
        systemInstruction: TAGS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            decisions: {
              type: 'object',
              additionalProperties: { type: 'string', enum: ['YES', 'NO'] },
            },
          },
        },
      },
    })

    const content = response.text
    if (!content) return []

    const result = JSON.parse(content) as { decisions?: Record<string, string> }

    if (!result.decisions || typeof result.decisions !== 'object') {
      return []
    }

    return Object.entries(result.decisions)
      .filter(([, decision]) => String(decision).toUpperCase() === 'YES')
      .map(([name]) => name)
      .filter(name =>
        existingTags.some(et => et.name.toLowerCase() === name.toLowerCase()),
      )
  } catch (err) {
    console.error('Tag classification failed:', (err as Error).message)
    return []
  }
}
