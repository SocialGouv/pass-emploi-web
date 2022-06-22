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

export default function renderPage(
  children: JSX.Element,
  options: {
    customSession?: Partial<Session>
    customDependances?: Partial<Dependencies>
    customConseiller?: Partial<Conseiller>
    idJeuneSetter?: (id: string | undefined) => void
  } = {}
): RenderResult {
  const { customSession, customDependances, customConseiller, idJeuneSetter } =
    options
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

  const defaultDependances: Dependencies = {
    actionsService: mockedActionsService(),
    agencesService: mockedAgencesService(),
    conseillerService: mockedConseillerService(),
    fichiersService: mockedFichiersService(),
    jeunesService: mockedJeunesService(),
    messagesService: mockedMessagesService(),
    rendezVousService: mockedRendezVousService(),
  }

  const dependances = { ...defaultDependances, ...customDependances }

  return render(
    <SessionProvider session={session}>
      <DIProvider dependances={dependances}>
        <ChatCredentialsProvider
          credentials={{
            token: 'firebaseToken',
            cleChiffrement: 'cleChiffrement',
          }}
        >
          <ConseillerProvider conseiller={unConseiller(customConseiller)}>
            <CurrentJeuneProvider
              idJeune={uneBaseJeune().id}
              setIdJeune={idJeuneSetter}
            >
              {children}
            </CurrentJeuneProvider>
          </ConseillerProvider>
        </ChatCredentialsProvider>
      </DIProvider>
    </SessionProvider>
  )
}
