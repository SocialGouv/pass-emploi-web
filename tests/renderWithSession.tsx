import { render, RenderResult } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import { unConseiller } from '../fixtures/conseiller'
import { ConseillerProvider } from '../utils/conseiller/conseillerContext'

import { Conseiller, UserStructure } from 'interfaces/conseiller'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'

export default function renderWithSession(
  children: JSX.Element,
  customSession?: Partial<Session>,
  customConseiller?: Partial<Conseiller>
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
  const conseiller = { ...unConseiller(), ...customConseiller }

  return render(
    <SessionProvider session={session}>
      <ChatCredentialsProvider
        credentials={{
          token: 'firebaseToken',
          cleChiffrement: 'cleChiffrement',
        }}
      >
        <ConseillerProvider conseiller={conseiller}>
          {children}
        </ConseillerProvider>
      </ChatCredentialsProvider>
    </SessionProvider>
  )
}
