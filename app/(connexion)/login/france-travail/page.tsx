import { Metadata } from 'next'
import React from 'react'

import LoginFranceTravailPage from 'app/(connexion)/login/france-travail/LoginFranceTravailPage'

export const metadata: Metadata = {
  title:
    'Connexion France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
}

export default async function LoginFranceTravail() {
  return <LoginFranceTravailPage />
}
