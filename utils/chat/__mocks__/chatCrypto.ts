import { EncryptedTextWithInitializationVector } from '../chatCrypto'

export function encrypt(message: string) {
  return { encryptedText: `Encrypted: ${message}`, iv: `IV: ${message}` }
}

export function encryptWithCustomIv(message: string) {
  return `Encrypted: ${message}`
}

export function decrypt({
  encryptedText,
}: EncryptedTextWithInitializationVector) {
  return `Decrypted: ${encryptedText}`
}
