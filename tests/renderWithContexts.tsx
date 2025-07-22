import { act, render, RenderResult } from '@testing-library/react'
import { Dispatch, ReactNode, SetStateAction } from 'react'

import { desActualitesRaw } from 'fixtures/actualites'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import {
  BeneficiaireEtChat,
  extractBeneficiaireWithActivity,
  Portefeuille,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { ActualitesProvider } from 'utils/actualitesContext'
import { Alerte, AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { CurrentConversationProvider } from 'utils/chat/currentConversationContext'
import {
  ListeSelectionneeProvider,
  ListeSelectionnee,
} from 'utils/chat/listeSelectionneeContext'
import { ShowRubriqueListeProvider } from 'utils/chat/showRubriqueListeContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('services/actualites.service', () => ({
  getActualites: jest.fn(async () => desActualitesRaw()),
}))

export default async function renderWithContexts(
  children: ReactNode,
  options: {
    customConseiller?: Partial<Conseiller>
    customPortefeuille?: Partial<{
      value: Portefeuille
      setter: (portefeuille: Portefeuille) => void
    }>
    customChats?: BeneficiaireEtChat[]
    customCurrentConversation?: Partial<{
      value: BeneficiaireEtChat
      setter: Dispatch<SetStateAction<BeneficiaireEtChat | undefined>>
    }>
    customAlerte?: Partial<{
      value: Alerte
      setter: (key: AlerteParam | undefined, target?: string) => void
    }>
    customShowRubriqueListe?: Partial<{
      value: boolean | undefined
      setter: (showRubriqueListe: boolean | undefined) => void
    }>
    customListeSelectionnee?: Partial<{
      value: ListeSelectionnee
      setter: (listeSelectionnee: ListeSelectionnee) => void
    }>
  } = {}
): Promise<RenderResult> {
  const {
    customConseiller,
    customPortefeuille,
    customChats,
    customCurrentConversation,
    customAlerte,
    customShowRubriqueListe,
    customListeSelectionnee,
  } = options
  const conseiller = unConseiller(customConseiller)

  const portefeuille = {
    ...customPortefeuille,
    value:
      customPortefeuille?.value ??
      desItemsBeneficiaires().map(extractBeneficiaireWithActivity),
  }

  const currentConversation = { ...customCurrentConversation }

  const alerte = { ...customAlerte }

  const showRubriqueListe = { ...customShowRubriqueListe }
  const listeSelectionnee = { ...customListeSelectionnee }
  const withContexts = (element: ReactNode) =>
    provideContexts(
      element,
      conseiller,
      portefeuille,
      customChats,
      currentConversation,
      alerte,
      showRubriqueListe,
      listeSelectionnee
    )

  let renderResult: RenderResult
  await act(async () => {
    renderResult = render(withContexts(children))
  })

  const rerender = renderResult!.rerender
  renderResult!.rerender = (rerenderChildren: ReactNode) =>
    rerender(withContexts(rerenderChildren))

  return renderResult!
}

function provideContexts(
  children: ReactNode,
  conseiller: Conseiller,
  portefeuille: Partial<{
    value: Portefeuille
    setter: (portefeuille: Portefeuille) => void
  }>,
  chats: BeneficiaireEtChat[] | undefined,
  currentConversation: Partial<{
    value: BeneficiaireEtChat
    setter: Dispatch<SetStateAction<BeneficiaireEtChat | undefined>>
  }>,
  alerte: Partial<{
    value: Alerte
    setter: (key: AlerteParam | undefined, target?: string) => void
  }>,
  showRubriqueListe: Partial<{
    value: boolean | undefined
    setter: (showRubriqueListe: boolean | undefined) => void
  }>,
  listeSelectionnee: Partial<{
    value: ListeSelectionnee
    setter: (listeSelectionnee: ListeSelectionnee) => void
  }>
) {
  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider
        portefeuille={portefeuille.value ?? []}
        setterForTests={portefeuille.setter}
      >
        <ActualitesProvider>
          <ChatCredentialsProvider
            credentials={{
              token: 'firebaseToken',
              cleChiffrement: 'cleChiffrement',
            }}
          >
            <ChatsProvider chatsForTests={chats ?? []}>
              <CurrentConversationProvider
                stateForTests={currentConversation.value}
                setterForTests={currentConversation.setter}
              >
                <AlerteProvider
                  alerteForTests={alerte.value}
                  setterForTests={alerte.setter}
                >
                  <ShowRubriqueListeProvider
                    valueForTests={showRubriqueListe.value}
                    setterForTests={showRubriqueListe.setter}
                  >
                    <ListeSelectionneeProvider
                      setterForTests={listeSelectionnee.setter}
                      valueForTests={listeSelectionnee.value}
                    >
                      {children}
                    </ListeSelectionneeProvider>
                  </ShowRubriqueListeProvider>
                </AlerteProvider>
              </CurrentConversationProvider>
            </ChatsProvider>
          </ChatCredentialsProvider>
        </ActualitesProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
