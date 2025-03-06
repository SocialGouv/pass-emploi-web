import { Metadata } from 'next'
import React from 'react'

import LoginFranceTravailDispositifsPage from 'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'

export const metadata: Metadata = {
  title:
    'Sélection du dispositif France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
}

export default async function LoginFranceTravailDispositifs() {
  return (
    <LoginFranceTravailDispositifsPage
      ssoAccompagnementsIntensifsSontActifs={
        process.env.NEXT_PUBLIC_ENABLE_ACCOMPAGNEMENTS_INTENSIFS_SSO === 'true'
      }
      ssoAvenirProEstActif={
        process.env.NEXT_PUBLIC_ENABLE_AVENIR_PRO_SSO === 'true'
      }
    />
  )
}
