import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import {
  mockedActionsService,
  mockedAgencesService,
  mockedConseillerService,
  mockedFavorisService,
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

export default function renderWithContexts(
  children: JSX.Element,
  options: {
    customDependances?: Partial<Dependencies>
    customConseiller?: Partial<Conseiller>
    customCurrentJeune?: Partial<{
      id: string
      idSetter: (id: string | undefined) => void
    }>
  } = {}
): RenderResult {
  const { customDependances, customConseiller, customCurrentJeune } = options
  const dependances: Dependencies = {
    actionsService: mockedActionsService(),
    agencesService: mockedAgencesService(),
    conseillerService: mockedConseillerService(),
    fichiersService: mockedFichiersService(),
    jeunesService: mockedJeunesService(),
    messagesService: mockedMessagesService(),
    rendezVousService: mockedRendezVousService(),
    favorisService: mockedFavorisService(),
    offresEmploiService: { getLienOffreEmploi: jest.fn() },
    servicesCiviqueService: { getLienServiceCivique: jest.fn() },
    ...customDependances,
  }

  const conseiller = unConseiller(customConseiller)

  const currentJeune = { ...customCurrentJeune }

  const withContexts = (element: JSX.Element) =>
    provideContexts(element, dependances, conseiller, currentJeune)

  const renderResult: RenderResult = render(withContexts(children))

  const rerender = renderResult.rerender
  renderResult.rerender = (rerenderChildren: JSX.Element) =>
    rerender(withContexts(rerenderChildren))

  return renderResult
}

function provideContexts(
  children: JSX.Element,
  dependances: Dependencies,
  conseiller: Conseiller,
  currentJeune: Partial<{
    id: string
    idSetter: (id: string | undefined) => void
  }>
) {
  return (
    <DIProvider dependances={dependances}>
      <ConseillerProvider conseiller={conseiller}>
        <ChatCredentialsProvider
          credentials={{
            token: 'firebaseToken',
            cleChiffrement: 'cleChiffrement',
          }}
        >
          <CurrentJeuneProvider
            idJeune={currentJeune.id}
            setIdJeune={currentJeune.idSetter}
          >
            {children}
          </CurrentJeuneProvider>
        </ChatCredentialsProvider>
      </ConseillerProvider>
    </DIProvider>
  )
}
