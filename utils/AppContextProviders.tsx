'use client'

import { apm } from '@elastic/apm-rum'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

import { MODAL_ROOT_ID } from 'components/Modal'
import { extractBaseJeune } from 'fixtures/jeune'
import { Conseiller } from 'interfaces/conseiller'
import { compareJeunesByNom, JeuneFromListe } from 'interfaces/jeune'
import { AlerteProvider } from 'utils/alerteContext'
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
  theme: 'cej' | 'brsa'
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
        <ChatsProvider>
          <CurrentJeuneProvider>
            <ShowRubriqueListeDeDiffusionProvider>
              <ListeDeDiffusionSelectionneeProvider>
                <AlerteProvider>
                  <ThemeProvider
                    defaultTheme={'cej'}
                    themes={['cej', 'brsa']}
                    forcedTheme={theme}
                  >
                    {children}
      <div id={MODAL_ROOT_ID} />            </ThemeProvider>
                </AlerteProvider>
              </ListeDeDiffusionSelectionneeProvider>
            </ShowRubriqueListeDeDiffusionProvider>
          </CurrentJeuneProvider>
        </ChatsProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
