import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { uneBaseJeune } from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedAgencesService,
  mockedConseillerService,
  mockedFichiersService,
  mockedJeunesService,
  mockedMessagesService,
  mockedRendezVousService,
} from 'fixtures/services'
import { Conseiller } from 'interfaces/conseiller'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'
import { Dependencies } from 'utils/injectionDependances/container'

export default function renderPage(
  children: JSX.Element,
  options: {
    customDependances?: Partial<Dependencies>
    customConseiller?: Partial<Conseiller>
    idJeuneSetter?: (id: string | undefined) => void
  } = {}
): RenderResult {
  const { customDependances, customConseiller, idJeuneSetter } = options

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
    <DIProvider dependances={dependances}>
      <ConseillerProvider conseiller={unConseiller(customConseiller)}>
        <ChatCredentialsProvider
          credentials={{
            token: 'firebaseToken',
            cleChiffrement: 'cleChiffrement',
          }}
        >
          <CurrentJeuneProvider
            idJeune={uneBaseJeune().id}
            setIdJeune={idJeuneSetter}
          >
            {children}
          </CurrentJeuneProvider>
        </ChatCredentialsProvider>
      </ConseillerProvider>
    </DIProvider>
  )
}
