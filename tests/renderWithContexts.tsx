import { render, RenderResult } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

import {
  mockedActionsService,
  mockedAgencesService,
  mockedConseillerService,
  mockedFichiersService,
  mockedJeunesService,
  mockedMessagesService,
  mockedRendezVousService,
} from '../fixtures/services'
import { Dependencies } from '../utils/injectionDependances/container'

import { unConseiller } from 'fixtures/conseiller'
import { uneBaseJeune } from 'fixtures/jeune'
import { Conseiller, UserStructure } from 'interfaces/conseiller'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'

export default function renderWithContexts(
  children: JSX.Element,
  options: {
    customSession?: Partial<Session>
    customDependances?: Partial<Dependencies>
    customConseiller?: Partial<Conseiller>
    customCurrentJeune?: Partial<{
      id: string
      idSetter: (id: string | undefined) => void
    }>
  } = {}
): RenderResult {
  const {
    customSession,
    customDependances,
    customConseiller,
    customCurrentJeune,
  } = options
  const session: Session = {
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
    ...customSession,
  }

  const dependances: Dependencies = {
    actionsService: mockedActionsService(),
    agencesService: mockedAgencesService(),
    conseillerService: mockedConseillerService(),
    fichiersService: mockedFichiersService(),
    jeunesService: mockedJeunesService(),
    messagesService: mockedMessagesService(),
    rendezVousService: mockedRendezVousService(),
    ...customDependances,
  }

  const conseiller = unConseiller(customConseiller)

  const currentJeune = { ...customCurrentJeune }

  const withContexts = (element: JSX.Element) =>
    provideContexts(element, session, dependances, conseiller, currentJeune)

  const renderResult: RenderResult = render(withContexts(children))

  const rerender = renderResult.rerender
  renderResult.rerender = (rerenderChildren: JSX.Element) =>
    rerender(withContexts(rerenderChildren))

  return renderResult
}

function provideContexts(
  children: JSX.Element,
  session: Session,
  dependances: Dependencies,
  conseiller: Conseiller,
  currentJeune: Partial<{
    id: string
    idSetter: (id: string | undefined) => void
  }>
) {
  return (
    <SessionProvider session={session}>
      <DIProvider dependances={dependances}>
        <ChatCredentialsProvider
          credentials={{
            token: 'firebaseToken',
            cleChiffrement: 'cleChiffrement',
          }}
        >
          <ConseillerProvider conseiller={conseiller}>
            <CurrentJeuneProvider
              idJeune={currentJeune.id}
              setIdJeune={currentJeune.idSetter}
            >
              {children}
            </CurrentJeuneProvider>
          </ConseillerProvider>
        </ChatCredentialsProvider>
      </DIProvider>
    </SessionProvider>
  )
}
