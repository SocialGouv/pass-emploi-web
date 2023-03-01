import { EncryptedTextWithInitializationVector } from '../chatCrypto'

export class ChatCrypto {
  encrypt = jest.fn((message: string) => ({
    encryptedText: `Encrypted: ${message}`,
    iv: `IV: ${message}`,
  }))
  encryptWithCustomIv = jest.fn((message: string) => `Encrypted: ${message}`)
  decrypt = jest.fn(
    ({ encryptedText }: EncryptedTextWithInitializationVector) =>
      `Decrypted: ${encryptedText}`
  )
}
