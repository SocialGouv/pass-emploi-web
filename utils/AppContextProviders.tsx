'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import ClientOnlyContainer from 'components/ClientOnlyContainer'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
  extractBeneficiaireWithActivity,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estPassEmploi } from 'interfaces/structure'
import { ActualitesProvider } from 'utils/actualitesContext'
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
    .map(extractBeneficiaireWithActivity)
    .sort(compareBeneficiairesByNom)

  const theme = estPassEmploi(conseiller.structure) ? 'darker' : 'neutral'

  apm.setUserContext({
    id: conseiller.id,
    username: `${conseiller.firstName} ${conseiller.lastName}`,
    email: conseiller.email,
  })

  return (
    <MobileViewportProvider>
      <ConseillerProvider conseiller={conseiller}>
        <PortefeuilleProvider portefeuille={portefeuilleTrie}>
          <ActualitesProvider>
            <ChatCredentialsProvider>
              <ChatsProvider>
                <CurrentConversationProvider>
                  <ShowRubriqueListeDeDiffusionProvider>
                    <ListeDeDiffusionSelectionneeProvider>
                      <AlerteProvider>
                        <ClientOnlyContainer>
                          <ThemeProvider
                            defaultTheme={'neutral'}
                            themes={['neutral', 'darker']}
                            forcedTheme={theme}
                          >
                            {children}
                          </ThemeProvider>
                        </ClientOnlyContainer>
                      </AlerteProvider>
                    </ListeDeDiffusionSelectionneeProvider>
                  </ShowRubriqueListeDeDiffusionProvider>
                </CurrentConversationProvider>
              </ChatsProvider>
            </ChatCredentialsProvider>
          </ActualitesProvider>
        </PortefeuilleProvider>
      </ConseillerProvider>
    </MobileViewportProvider>
  )
}
