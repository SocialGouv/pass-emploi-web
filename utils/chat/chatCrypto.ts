import AES from 'crypto-js/aes'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import WordArray from 'crypto-js/lib-typedarrays'

interface encryptedTextWithIv {
  encryptedText: string
  iv: string
}

export class ChatCrypto {
  key: CryptoJS.lib.WordArray
  constructor() {
    this.key = Utf8.parse(process.env.FIREBASE_CRYPT_KEY ?? '')
  }

  encrypt(message: string): encryptedTextWithIv {
    const iv = WordArray.random(16)
    const encrypted = AES.encrypt(message, this.key, { iv })

    return {
      encryptedText: encrypted.ciphertext.toString(Base64),
      iv: encrypted.iv.toString(Base64),
    }
  }

  decrypt(encryptedText: encryptedTextWithIv): string {
    return AES.decrypt(encryptedText.encryptedText, this.key, {
      iv: Base64.parse(encryptedText.iv),
    }).toString(Utf8)
  }
}
