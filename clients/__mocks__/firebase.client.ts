import { of } from 'rxjs'

import { unChat } from 'fixtures/jeune'
import { Chat } from 'interfaces/jeune'

export const FirebaseClient = jest.fn(() => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  addMessage: jest.fn(),
  updateChat: jest.fn(),
  findAndObserveChatDuJeune: jest.fn(() => of(unChat())),
  observeChat: jest.fn(() => of(unChat())),
  observeMessagesDuChat: jest.fn(() => of([])),
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
