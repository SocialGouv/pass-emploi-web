import { render, RenderResult } from '@testing-library/react'
import React, { Dispatch, ReactNode, SetStateAction } from 'react'

import {
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { BaseBeneficiaire, BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { AlerteParam } from 'referentiel/alerteParam'
import { Alerte, AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import {
  CurrentConversation,
  CurrentConversationProvider,
} from 'utils/chat/currentConversationContext'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
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
      value: ListeDeDiffusion | undefined
      setter: (
        listeDeDiffusionSelectionnee: ListeDeDiffusion | undefined
      ) => void
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
    value: ListeDeDiffusion | undefined
    setter: (listeDeDiffusionSelectionnee: ListeDeDiffusion | undefined) => void
  }>
) {
  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider
        portefeuille={portefeuille.value ?? []}
        setterForTests={portefeuille.setter}
      >
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
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
