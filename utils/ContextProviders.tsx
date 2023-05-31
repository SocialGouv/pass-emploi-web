import { ThemeProvider } from 'next-themes'
import React, { ReactElement } from 'react'

import Layout from 'components/layouts/Layout'
import { AlerteProvider } from 'utils/alerteContext'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ListeDeDiffusionSelectionneeProvider } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { ShowRubriqueListeDeDiffusionProvider } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default function ContextProviders({
  children,
}: {
  children: ReactElement
}) {
  return (
    <ConseillerProvider>
      <PortefeuilleProvider>
        <ChatCredentialsProvider>
          <CurrentJeuneProvider>
            <AlerteProvider>
              <ShowRubriqueListeDeDiffusionProvider>
                <ListeDeDiffusionSelectionneeProvider>
                  <ThemeProvider defaultTheme={'cej'} themes={['cej', 'brsa']}>
                    <Layout>{children}</Layout>
                  </ThemeProvider>
                </ListeDeDiffusionSelectionneeProvider>
              </ShowRubriqueListeDeDiffusionProvider>
            </AlerteProvider>
          </CurrentJeuneProvider>
        </ChatCredentialsProvider>
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
