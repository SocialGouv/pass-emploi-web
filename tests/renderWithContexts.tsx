import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, extractBaseJeune } from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedAgendaService,
  mockedConseillerService,
  mockedEvenementsService,
  mockedFavorisService,
  mockedFichiersService,
  mockedImmersionsService,
  mockedJeunesService,
  mockedListesDeDiffusionService,
  mockedMessagesService,
  mockedOffresEmploiService,
  mockedReferentielService,
  mockedServicesCiviquesService,
  mockedSuggestionsService,
} from 'fixtures/services'
import { Conseiller } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { Alerte, AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'
import { Dependencies } from 'utils/injectionDependances/container'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function renderWithContexts(
  children: JSX.Element,
  options: {
    customDependances?: Partial<Dependencies>
    customConseiller?: Partial<Conseiller>
    customPortefeuille?: Partial<{
      value: BaseJeune[]
      setter: (portefeuille: BaseJeune[]) => void
    }>
    customCurrentJeune?: Partial<{
      id: string
      idSetter: (id: string | undefined) => void
    }>
    customAlerte?: Partial<{
      alerte: Alerte
      alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    }>
  } = {}
): RenderResult {
  const {
    customDependances,
    customConseiller,
    customPortefeuille,
    customCurrentJeune,
    customAlerte,
  } = options
  const dependances: Dependencies = {
    actionsService: mockedActionsService(),
    referentielService: mockedReferentielService(),
    conseillerService: mockedConseillerService(),
    fichiersService: mockedFichiersService(),
    jeunesService: mockedJeunesService(),
    messagesService: mockedMessagesService(),
    evenementsService: mockedEvenementsService(),
    favorisService: mockedFavorisService(),
    offresEmploiService: mockedOffresEmploiService(),
    servicesCiviquesService: mockedServicesCiviquesService(),
    immersionsService: mockedImmersionsService(),
    suggestionsService: mockedSuggestionsService(),
    agendaService: mockedAgendaService(),
    listesDeDiffusionService: mockedListesDeDiffusionService(),
    ...customDependances,
  }

  const conseiller = unConseiller(customConseiller)

  const portefeuille = {
    ...customPortefeuille,
    value: customPortefeuille?.value ?? desItemsJeunes().map(extractBaseJeune),
  }

  const currentJeune = { ...customCurrentJeune }

  const alerte = { ...customAlerte }

  const withContexts = (element: JSX.Element) =>
    provideContexts(
      element,
      dependances,
      conseiller,
      portefeuille,
      currentJeune,
      alerte
    )

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
  portefeuille: Partial<{
    value: BaseJeune[]
    setter: (portefeuille: BaseJeune[]) => void
  }>,
  currentJeune: Partial<{
    id: string
    idSetter: (id: string | undefined) => void
  }>,
  alerte: Partial<{
    alerte: Alerte
    alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  }>
) {
  return (
    <DIProvider dependances={dependances}>
      <ConseillerProvider conseillerForTests={conseiller}>
        <PortefeuilleProvider
          beneficiairesForTests={portefeuille.value}
          setterForTests={portefeuille.setter}
        >
          <ChatCredentialsProvider
            credentialsForTests={{
              token: 'firebaseToken',
              cleChiffrement: 'cleChiffrement',
            }}
          >
            <CurrentJeuneProvider
              idForTests={currentJeune.id}
              setterForTests={currentJeune.idSetter}
            >
              <AlerteProvider
                alerteForTests={alerte.alerte}
                setterForTests={alerte.alerteSetter}
              >
                {children}
              </AlerteProvider>
            </CurrentJeuneProvider>
          </ChatCredentialsProvider>
        </PortefeuilleProvider>
      </ConseillerProvider>
    </DIProvider>
  )
}
