import { unChat } from 'fixtures/jeune'
import { Message } from 'interfaces'
import { Chat } from 'interfaces/jeune'

const FirebaseClient = jest.fn(() => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  addMessage: jest.fn(),
  updateChat: jest.fn(),
  findAndObserveChatDuJeune: jest.fn(
    (
      idConseiller: string,
      idJeune: string,
      fn: (idChat: string, chat: Chat) => void
    ) => fn('idChat', unChat())
  ),
  observeChat: jest.fn((idChat: string, fn: (chat: Chat) => void) =>
    fn(unChat())
  ),
  observeMessagesDuChat: jest.fn(
    (idChat: string, fn: (messages: Message[]) => void) => fn([])
  ),
  getChatDuJeune: jest.fn(() => unChat()),
}))

export { FirebaseClient }
