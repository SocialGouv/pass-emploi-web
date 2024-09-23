import { render, RenderResult } from '@testing-library/react'
import React, { Dispatch, ReactNode, SetStateAction } from 'react'

import { uneActualite } from 'fixtures/actualites'
import {
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { BaseBeneficiaire, BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { ActualitesProvider } from 'utils/actualitesContext'
import { Alerte, AlerteProvider } from 'utils/alerteContext'
import { RenderedWPPageType } from 'utils/AppContextProviders'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import {
  CurrentConversation,
  CurrentConversationProvider,
} from 'utils/chat/currentConversationContext'
import {
  ListeDeDiffusionSelectionneeProvider,
  ListeSelectionnee,
} from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function renderWithContexts(
  children: ReactNode,
  options: {
    customConseiller?: Partial<Conseiller>
    customPortefeuille?: Partial<{
      value: BaseBeneficiaire[]
      setter: (portefeuille: BaseBeneficiaire[]) => void
    }>
    customChats?: BeneficiaireEtChat[]
    customCurrentConversation?: Partial<{
      value: CurrentConversation
      setter: Dispatch<SetStateAction<CurrentConversation | undefined>>
    }>
    customAlerte?: Partial<{
      value: Alerte
      setter: (key: AlerteParam | undefined, target?: string) => void
    }>
    customShowRubriqueListeDeDiffusion?: Partial<{
      value: boolean | undefined
      setter: (showRubriqueListeDeDiffusion: boolean | undefined) => void
    }>
    customListeDeDiffusionSelectionnee?: Partial<{
      value: ListeSelectionnee
      setter: (listeDeDiffusionSelectionnee: ListeSelectionnee) => void
    }>
  } = {}
): RenderResult {
  const {
    customConseiller,
    customPortefeuille,
    customChats,
    customCurrentConversation,
    customAlerte,
    customShowRubriqueListeDeDiffusion,
    customListeDeDiffusionSelectionnee,
  } = options
  const conseiller = unConseiller(customConseiller)

  const actualites = uneActualite()

  const portefeuille = {
    ...customPortefeuille,
    value:
      customPortefeuille?.value ??
      desItemsBeneficiaires().map(extractBaseBeneficiaire),
  }

  const currentConversation = { ...customCurrentConversation }

  const alerte = { ...customAlerte }

  const showRubriqueListeDeDiffusion = { ...customShowRubriqueListeDeDiffusion }
  const listeDeDiffusionSelectionnee = { ...customListeDeDiffusionSelectionnee }
  const withContexts = (element: ReactNode) =>
    provideContexts(
      actualites,
      element,
      conseiller,
      portefeuille,
      customChats,
      currentConversation,
      alerte,
      showRubriqueListeDeDiffusion,
      listeDeDiffusionSelectionnee
    )

  const renderResult: RenderResult = render(withContexts(children))

  const rerender = renderResult.rerender
  renderResult.rerender = (rerenderChildren: ReactNode) =>
    rerender(withContexts(rerenderChildren))

  return renderResult
}

function provideContexts(
  actualites: string,
  children: ReactNode,
  conseiller: Conseiller,
  portefeuille: Partial<{
    value: BaseBeneficiaire[]
    setter: (portefeuille: BaseBeneficiaire[]) => void
  }>,
  chats: BeneficiaireEtChat[] | undefined,
  currentConversation: Partial<{
    value: CurrentConversation
    setter: Dispatch<SetStateAction<CurrentConversation | undefined>>
  }>,
  alerte: Partial<{
    value: Alerte
    setter: (key: AlerteParam | undefined, target?: string) => void
  }>,
  showRubriqueListeDeDiffusion: Partial<{
    value: boolean | undefined
    setter: (showRubriqueListeDeDiffusion: boolean | undefined) => void
  }>,
  listeDeDiffusionSelectionnee: Partial<{
    value: ListeSelectionnee
    setter: (listeDeDiffusionSelectionnee: ListeSelectionnee) => void
  }>
) {
  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider
        portefeuille={portefeuille.value ?? []}
        setterForTests={portefeuille.setter}
      >
        <ActualitesProvider actualites={actualites}>
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
                  <ShowRubriqueListeDeDiffusionProvider
                    valueForTests={showRubriqueListeDeDiffusion.value}
                    setterForTests={showRubriqueListeDeDiffusion.setter}
                  >
                    <ListeDeDiffusionSelectionneeProvider
                      setterForTests={listeDeDiffusionSelectionnee.setter}
                      valueForTests={listeDeDiffusionSelectionnee.value}
                    >
                      {children}
                    </ListeDeDiffusionSelectionneeProvider>
                  </ShowRubriqueListeDeDiffusionProvider>
                </AlerteProvider>
              </CurrentConversationProvider>
            </ChatsProvider>
          </ChatCredentialsProvider>
        </ActualitesProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
