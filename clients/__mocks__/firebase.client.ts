import { unChat } from 'fixtures/jeune'
import { Message } from 'interfaces'
import { Chat } from 'interfaces/jeune'

const FirebaseClient = jest.fn(() => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  addMessage: jest.fn(),
  updateChat: jest.fn(),
  findAndObserveChatDuJeune: jest.fn(
    (idConseiller: string, idJeune: string, fn: (chat: Chat) => void) =>
      fn(unChat())
  ),
  observeChat: jest.fn((idChat: string, fn: (chat: Chat) => void) =>
    fn(unChat())
  ),
  observeMessagesDuChat: jest.fn(
    (idChat: string, fn: (messages: Message[]) => void) => fn([])
  ),
  getChatsDesJeunes: jest.fn((_, idsJeunes: string[]) =>
    idsJeunes.reduce((mappedChats, idJeune) => {
      return {
        ...mappedChats,
        [idJeune]: unChat({ chatId: `chat-id-${idJeune}` }),
      }
    }, {} as { [idJeune: string]: Chat })
  ),
  countMessagesNotRead: jest.fn(),
}))

export { FirebaseClient }
