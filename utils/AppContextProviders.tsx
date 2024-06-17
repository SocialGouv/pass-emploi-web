'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import { extractBaseJeune } from 'fixtures/jeune'
import { Conseiller } from 'interfaces/conseiller'
import { compareJeunesByNom, JeuneFromListe } from 'interfaces/jeune'
import { AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function AppContextProviders({
  conseiller,
  portefeuille,
  theme,
  children,
}: {
  conseiller: Conseiller
  portefeuille: JeuneFromListe[]
  theme: 'cej' | 'pass-emploi'
  children: ReactNode
}) {
  const portefeuilleTrie = portefeuille
    .map(extractBaseJeune)
    .sort(compareJeunesByNom)

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
            <CurrentJeuneProvider>
              <ShowRubriqueListeDeDiffusionProvider>
                <ListeDeDiffusionSelectionneeProvider>
                  <AlerteProvider>
                    <ThemeProvider
                      defaultTheme={'cej'}
                      themes={['cej', 'pass-emploi']}
                      forcedTheme={theme}
                    >
                      {children}
                    </ThemeProvider>
                  </AlerteProvider>
                </ListeDeDiffusionSelectionneeProvider>
              </ShowRubriqueListeDeDiffusionProvider>
            </CurrentJeuneProvider>
          </ChatsProvider>
        </ChatCredentialsProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
