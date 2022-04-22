import { unChat } from 'fixtures/jeune'
import { Message } from 'interfaces/message'
import { Chat } from 'interfaces/jeune'

export const FirebaseClient = jest.fn(() => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  addMessage: jest.fn(),
  updateChat: jest.fn(),
  findAndObserveChatDuJeune: jest.fn(
    (_idConseiller: string, _idJeune: string, fn: (chat: Chat) => void) =>
      fn(unChat())
  ),
  observeChat: jest.fn((_idChat: string, fn: (chat: Chat) => void) =>
    fn(unChat())
  ),
  observeMessagesDuChat: jest.fn(
    (_idChat: string, fn: (messages: Message[]) => void) => fn([])
  ),
  getChatsDesJeunes: jest.fn((_idConseiller, idsJeunes: string[]) =>
    idsJeunes.reduce((mappedChats, idJeune) => {
      return {
        ...mappedChats,
        [idJeune]: unChat({ chatId: `chat-id-${idJeune}` }),
      }
    }, {} as { [idJeune: string]: Chat })
  ),
  countMessagesNotRead: jest.fn(),
}))
