'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import { extractBaseBeneficiaire } from 'fixtures/beneficiaire'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { ActualitesProvider } from 'utils/actualitesContext'
import { AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export type RenderedWPPageType = {
  id: number
  date: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  status: string
  slug: string
  [key: string]: any
}

export default function AppContextProviders({
  conseiller,
  portefeuille,
  theme,
  actualitesData,
  children,
}: {
  conseiller: Conseiller
  portefeuille: BeneficiaireFromListe[]
  theme: 'cej' | 'pass-emploi'
  actualitesData: RenderedWPPageType
  children: ReactNode
}) {
  const portefeuilleTrie = portefeuille
    .map(extractBaseBeneficiaire)
    .sort(compareBeneficiairesByNom)

  apm.setUserContext({
    id: conseiller.id,
    username: `${conseiller.firstName} ${conseiller.lastName}`,
    email: conseiller.email,
  })

  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider portefeuille={portefeuilleTrie}>
        <ActualitesProvider actualites={actualitesData}>
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
        </ActualitesProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
