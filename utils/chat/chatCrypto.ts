import AES from 'crypto-js/aes'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import WordArray from 'crypto-js/lib-typedarrays'

export interface EncryptedTextWithInitializationVector {
  encryptedText: string
  iv: string
}

export class ChatCrypto {
  encrypt(
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

  decrypt(
    encryptedText: EncryptedTextWithInitializationVector,
    cleChiffrement: string
  ): string {
    const key = Utf8.parse(cleChiffrement)
    return AES.decrypt(encryptedText.encryptedText, key, {
      iv: Base64.parse(encryptedText.iv),
    }).toString(Utf8)
  }
}
