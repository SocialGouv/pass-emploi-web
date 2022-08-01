import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'

export default function renderWithChatCredentials(
  children: JSX.Element
): RenderResult {
  const renderResult = render(provideChatCredentials(children))

  const rerender = renderResult.rerender
  renderResult.rerender = (rerenderChildren: JSX.Element) =>
    rerender(provideChatCredentials(rerenderChildren))

  return renderResult
}

function provideChatCredentials(children: JSX.Element) {
  return (
    <ChatCredentialsProvider
      credentials={{
        token: 'firebaseToken',
        cleChiffrement: 'cleChiffrement',
      }}
    >
      {children}
    </ChatCredentialsProvider>
  )
}
