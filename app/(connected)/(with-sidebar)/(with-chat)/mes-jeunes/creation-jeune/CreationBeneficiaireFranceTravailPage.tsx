'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { ReactElement, useState } from 'react'

import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { BeneficiaireFranceTravailFormData } from 'interfaces/json/beneficiaire'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

function CreationBeneficiaireFranceTravailPage(): ReactElement {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const [creationError, setCreationError] = useState<string>()
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  async function creerJeunePoleEmploi(
    newJeune: BeneficiaireFranceTravailFormData
  ): Promise<void> {
    setCreationError(undefined)
    setCreationEnCours(true)

    try {
      const { createCompteJeunePoleEmploi } = await import(
        'services/jeunes.service'
      )
      const beneficiaireCree = await createCompteJeunePoleEmploi({
        firstName: newJeune.prenom,
        lastName: newJeune.nom,
        email: newJeune.email,
      })

      setPortefeuille(portefeuille.concat(beneficiaireCree))
      setAlerte(AlerteParam.creationBeneficiaire, beneficiaireCree.id)
      router.push('/mes-jeunes')
    } catch (error) {
      setCreationError(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    } finally {
      setCreationEnCours(false)
    }
  }

  useMatomo(
    creationError ? 'Création jeune PE en erreur' : 'Création jeune PE',
    portefeuille.length > 0
  )

  return (
    <FormulaireJeunePoleEmploi
      creerJeunePoleEmploi={creerJeunePoleEmploi}
      creationError={creationError}
      creationEnCours={creationEnCours}
    />
  )
}

export default withTransaction(
  CreationBeneficiaireFranceTravailPage.name,
  'page'
)(CreationBeneficiaireFranceTravailPage)
