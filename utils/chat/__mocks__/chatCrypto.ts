import { EncryptedTextWithInitializationVector } from '../chatCrypto'

const ChatCrypto = jest.fn(() => ({
  encrypt: jest.fn((message: string) => ({
    encryptedText: `Encrypted: ${message}`,
    iv: `IV: ${message}`,
  })),
  decrypt: jest.fn(
    ({ encryptedText }: EncryptedTextWithInitializationVector) =>
      `Decrypted: ${encryptedText}`
  ),
}))

export { ChatCrypto }
