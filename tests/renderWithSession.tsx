import { render, RenderResult } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import { UserStructure } from 'interfaces/conseiller'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'

export default function renderWithSession(
  children: JSX.Element,
  customSession?: Partial<Session>
): RenderResult {
  const defaultSession: Session = {
    user: {
      id: '1',
      name: 'Nils Tavernier',
      email: 'fake@email.com',
      structure: UserStructure.MILO,
      estConseiller: true,
      estSuperviseur: false,
    },
    accessToken: 'accessToken',
    expires: new Date(Date.now() + 300000).toISOString(),
  }

  const session = { ...defaultSession, ...customSession }

  const renderResult = render( provideSession(children, session))

  const rerender = renderResult.rerender
  renderResult.rerender = (rerenderChildren: JSX.Element) =>
    rerender( provideSession(rerenderChildren, session))

  return renderResult
}

function provideSession (children : JSX.Element, session : Session ){
    return <SessionProvider session={session}>
        <ChatCredentialsProvider
            credentials={{
                token: 'firebaseToken',
                cleChiffrement: 'cleChiffrement',
            }}
        >
            {children}
        </ChatCredentialsProvider>
    </SessionProvider>
}
