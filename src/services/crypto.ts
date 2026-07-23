const SALT = new TextEncoder().encode('chesser-aihub-v1')

async function deriveKey(userId: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userId),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export async function encryptApiKey(userId: string, plaintext: string): Promise<string> {
  if (!plaintext) return ''
  const key = await deriveKey(userId)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return toBase64(iv.buffer) + '.' + toBase64(encrypted)
}

export async function decryptApiKey(userId: string, ciphertext: string): Promise<string> {
  if (!ciphertext) return ''
  try {
    const dotIndex = ciphertext.indexOf('.')
    if (dotIndex === -1) return ciphertext
    const key = await deriveKey(userId)
    const iv = new Uint8Array(fromBase64(ciphertext.slice(0, dotIndex)))
    const data = fromBase64(ciphertext.slice(dotIndex + 1))
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(decrypted)
  } catch {
    return ciphertext
  }
}
