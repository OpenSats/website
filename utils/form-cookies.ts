import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'
import { serialize, parse } from 'cookie'
import type { NextApiResponse } from 'next'

const COOKIE_SECRET = process.env.COOKIE_SECRET || process.env.FORM_SECRET || 'default-dev-secret-change-in-production'
const COOKIE_NAME = 'grant_form_data'

// Derive a 32-byte key from the secret
function getEncryptionKey(): Buffer {
  return createHash('sha256').update(COOKIE_SECRET).digest()
}

/**
 * Encrypt form data for secure cookie storage
 */
function encryptData(data: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)

  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt form data from cookie
 */
function decryptData(encryptedData: string): string | null {
  try {
    const key = getEncryptionKey()
    const [ivHex, encrypted] = encryptedData.split(':')

    if (!ivHex || !encrypted) return null

    const iv = Buffer.from(ivHex, 'hex')
    const decipher = createDecipheriv('aes-256-cbc', key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Failed to decrypt form data:', error)
    return null
  }
}

/**
 * Save form data to encrypted session cookie
 */
export function saveFormDataToCookie(res: NextApiResponse, formData: Record<string, any>): void {
  try {
    const jsonData = JSON.stringify(formData)
    const encrypted = encryptData(jsonData)

    const cookie = serialize(COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/apply',
      // Session cookie - expires when browser closes
    })

    res.setHeader('Set-Cookie', cookie)
  } catch (error) {
    console.error('Failed to save form data to cookie:', error)
  }
}

/**
 * Read form data from encrypted cookie
 */
export function getFormDataFromCookie(cookieHeader?: string): Record<string, any> | null {
  if (!cookieHeader) return null

  try {
    const cookies = parse(cookieHeader)
    const encryptedData = cookies[COOKIE_NAME]

    if (!encryptedData) return null

    const decrypted = decryptData(encryptedData)
    if (!decrypted) return null

    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Failed to read form data from cookie:', error)
    return null
  }
}

/**
 * Clear form data cookie
 */
export function clearFormDataCookie(res: NextApiResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/apply',
    maxAge: 0, // Expire immediately
  })

  res.setHeader('Set-Cookie', cookie)
}
