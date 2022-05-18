import { createContext, ReactNode, useContext, useState } from 'react'

import { ChatCredentials } from 'interfaces/message'

type MaybeChatCredentials = ChatCredentials | undefined
type ChatCredentialsState = [
  MaybeChatCredentials,
  (credentials: MaybeChatCredentials) => void
]

const ChatCredentialsContext = createContext<ChatCredentialsState | undefined>(
  undefined
)

export function ChatCredentialsProvider({
  children,
  credentials,
}: {
  children: ReactNode
  credentials?: ChatCredentials
}) {
  const chatCredentialsState = useState<MaybeChatCredentials>(credentials)
  return (
    <ChatCredentialsContext.Provider value={chatCredentialsState}>
      {children}
    </ChatCredentialsContext.Provider>
  )
}

export function useChatCredentials(): ChatCredentialsState {
  const chatCredentialsContext = useContext(ChatCredentialsContext)
  if (!chatCredentialsContext) {
    throw new Error(
      'useChatCredentials must be used within ChatCredentialsProvider'
    )
  }
  return chatCredentialsContext
}
