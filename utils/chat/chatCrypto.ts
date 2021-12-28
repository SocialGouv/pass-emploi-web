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
  constructor(key: string) {
    this.key = Utf8.parse(key)
  }

  encrypt(message: string): encryptedTextWithIv {
    const iv = WordArray.random(16)
    let encrypted = AES.encrypt(message, this.key, { iv })

    let result: encryptedTextWithIv = {
      encryptedText: encrypted.ciphertext.toString(Base64),
      iv: encrypted.iv.toString(Base64),
    }
    return result
  }

  decrypt(encryptedText: encryptedTextWithIv): string {
    let decrypted = AES.decrypt(encryptedText.encryptedText, this.key, {
      iv: Base64.parse(encryptedText.iv),
    })
    return decrypted.toString(Utf8)
  }
}
