import { EncryptedTextWithInitializationVector } from '../chatCrypto'

const ChatCrypto = jest.fn(() => ({
  encrypt: jest.fn((message: string) => ({
    encryptedText: `Encrypted: ${message}`,
    iv: `IV: ${message}`,
  })),
  encryptWithCustomIv: jest.fn((message: string) => `Encrypted: ${message}`),
  decrypt: jest.fn(
    ({ encryptedText }: EncryptedTextWithInitializationVector) =>
      `Decrypted: ${encryptedText}`
  ),
}))

export { ChatCrypto }
