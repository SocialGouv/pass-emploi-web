import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { ChatCreds } from 'interfaces/message'

type MaybeChatCreds = ChatCreds | undefined
type ChatCredsState = [MaybeChatCreds, (creds: MaybeChatCreds) => void]

const ChatCredsContext = createContext<ChatCredsState | undefined>(undefined)

export function ChatCredsProvider({
  children,
  creds,
  setCreds,
}: {
  children: ReactNode
  creds?: ChatCreds
  setCreds?: (creds: MaybeChatCreds) => void
}) {
  const [chatCreds, setChatCreds] = useState<MaybeChatCreds>(creds)
  const setter = setCreds ?? setChatCreds
  const value: ChatCredsState = useMemo(
    () => [chatCreds, setter],
    [chatCreds, setter]
  )

  return (
    <ChatCredsContext.Provider value={value}>
      {children}
    </ChatCredsContext.Provider>
  )
}

export function useChatCreds(): ChatCredsState {
  const chatCredsContext = useContext(ChatCredsContext)
  if (!chatCredsContext) {
    throw new Error('chatCredsContext must be used within ChatCredsProvider')
  }
  return chatCredsContext
}
