import { unChat } from 'fixtures/jeune'
import { Chat } from 'interfaces/jeune'
import { Message } from 'interfaces/message'

export const FirebaseClient = jest.fn(() => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  addMessage: jest.fn(),
  addFichier: jest.fn(),
  updateChat: jest.fn(),
  findAndObserveChatsDuConseiller: jest.fn(
    (_idConseiller: string, fn: (chats: { [idJeune: string]: Chat }) => void) =>
      fn({ 'jeune-1': unChat(), 'jeune-2': unChat(), 'jeune-3': unChat() })
  ),
  observeChat: jest.fn((_idChat: string, fn: (chat: Chat) => void) =>
    fn(unChat())
  ),
  observeMessagesDuChat: jest.fn(
    (_idChat: string, fn: (messages: Message[]) => void) => fn([])
  ),
  getChatsDuConseiller: jest.fn((_idConseiller) => ({
    'jeune-1': unChat({ chatId: `chat-jeune-1` }),
    'jeune-2': unChat({ chatId: `chat-jeune-2` }),
    'jeune-3': unChat({ chatId: `chat-jeune-3` }),
  })),
  countMessagesNotRead: jest.fn(),
}))
