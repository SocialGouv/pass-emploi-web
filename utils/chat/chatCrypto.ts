import AES from 'crypto-js/aes'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import WordArray from 'crypto-js/lib-typedarrays'
import { captureError } from 'utils/monitoring/elastic'

export interface EncryptedTextWithInitializationVector {
  encryptedText: string
  iv: string
}

export function encrypt(
  message: string,
  cleChiffrement: string
): EncryptedTextWithInitializationVector {
  const key = Utf8.parse(cleChiffrement)
  const iv = WordArray.random(16)
  const encrypted = AES.encrypt(message, key, { iv })

  return {
    encryptedText: encrypted.ciphertext.toString(Base64),
    iv: encrypted.iv.toString(Base64),
  }
}

export function encryptWithCustomIv(
  message: string,
  cleChiffrement: string,
  customIv: string
): string {
  const key = Utf8.parse(cleChiffrement)
  const iv = Base64.parse(customIv)
  const encrypted = AES.encrypt(message, key, { iv })

  return encrypted.ciphertext.toString(Base64)
}

export function decrypt(
  encryptedText: EncryptedTextWithInitializationVector,
  cleChiffrement: string
): string {
  try {
    const key = Utf8.parse(cleChiffrement)
    return AES.decrypt(encryptedText.encryptedText, key, {
      iv: Base64.parse(encryptedText.iv),
    }).toString(Utf8)
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    return 'Erreur lors du déchiffrement du message'
  }
}
