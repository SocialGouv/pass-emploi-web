'use client'

import { utiliseChat } from 'interfaces/conseiller'
import { ChatCredentials } from 'interfaces/message'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { getChatCredentials, signIn } from 'services/messages.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const ChatCredentialsContext = createContext<ChatCredentials | undefined>(
  undefined
)

export function ChatCredentialsProvider({
  children,
  credentials,
}: {
  children: ReactNode
  credentials?: ChatCredentials
}) {
  const [conseiller] = useConseiller()
  const [chatCredentials, setChatCredentials] = useState<
    ChatCredentials | undefined
  >(credentials)

  useEffect(() => {
    if (utiliseChat(conseiller) && !chatCredentials) {
      getChatCredentials()
        .then((c) => signIn(c.token).then(() => c))
        .then(setChatCredentials)
    }
  }, [conseiller, chatCredentials])

  return (
    <ChatCredentialsContext.Provider value={chatCredentials}>
      {children}
    </ChatCredentialsContext.Provider>
  )
}

export function useChatCredentials(): ChatCredentials | undefined {
  return useContext(ChatCredentialsContext)
}
