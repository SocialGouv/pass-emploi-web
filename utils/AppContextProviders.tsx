'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import { extractBaseBeneficiaire } from 'fixtures/beneficiaire'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
} from 'interfaces/beneficiaire'
import { Conseiller, estPassEmploi } from 'interfaces/conseiller'
import { AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { CurrentConversationProvider } from 'utils/chat/currentConversationContext'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { MobileViewportProvider } from 'utils/mobileViewportContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function AppContextProviders({
  conseiller,
  portefeuille,
  children,
}: {
  conseiller: Conseiller
  portefeuille: BeneficiaireFromListe[]
  children: ReactNode
}) {
  const portefeuilleTrie = portefeuille
    .map(extractBaseBeneficiaire)
    .sort(compareBeneficiairesByNom)

  const theme = estPassEmploi(conseiller) ? 'darker' : 'neutral'

  apm.setUserContext({
    id: conseiller.id,
    username: `${conseiller.firstName} ${conseiller.lastName}`,
    email: conseiller.email,
  })

  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider portefeuille={portefeuilleTrie}>
        <ChatCredentialsProvider>
          <ChatsProvider>
            <CurrentConversationProvider>
              <ShowRubriqueListeDeDiffusionProvider>
                <ListeDeDiffusionSelectionneeProvider>
                  <AlerteProvider>
                    <MobileViewportProvider>
                      <ThemeProvider
                        defaultTheme={'neutral'}
                        themes={['neutral', 'darker']}
                        forcedTheme={theme}
                      >
                        {children}
                      </ThemeProvider>
                    </MobileViewportProvider>
                  </AlerteProvider>
                </ListeDeDiffusionSelectionneeProvider>
              </ShowRubriqueListeDeDiffusionProvider>
            </CurrentConversationProvider>
          </ChatsProvider>
        </ChatCredentialsProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
