'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React, { ReactElement, useState } from 'react'

import FormulaireBeneficiaireFranceTravail from 'components/jeune/FormulaireBeneficiaireFranceTravail'
import { BeneficiaireFranceTravailFormData } from 'interfaces/json/beneficiaire'
import { Liste } from 'interfaces/liste'
import { estAvenirPro, estConseilDepartemental } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

function CreationBeneficiaireFranceTravailPage({
  listes,
}: {
  listes?: Liste[]
}): ReactElement {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const [creationError, setCreationError] = useState<string>()
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  async function creerBeneficiaireFranceTravail(
    nouveauBeneficiaire: BeneficiaireFranceTravailFormData
  ): Promise<void> {
    setCreationError(undefined)
    setCreationEnCours(true)

    try {
      const { createCompteJeuneFranceTravail } = await import(
        'services/beneficiaires.service'
      )
      const beneficiaireCree = await createCompteJeuneFranceTravail({
        firstName: nouveauBeneficiaire.prenom,
        lastName: nouveauBeneficiaire.nom,
        email: nouveauBeneficiaire.email,
      })

      if (estAvenirPro(conseiller.structure)) {
        if (!nouveauBeneficiaire.idListe) {
          throw new Error("Aucune liste de diffusion n'est sélectionnée.")
        }

        const { ajouterBeneficiaireAListe } = await import(
          'services/listes.service'
        )
        await ajouterBeneficiaireAListe(
          nouveauBeneficiaire.idListe,
          beneficiaireCree.id,
          conseiller.id
        )
      }
      setPortefeuille(
        portefeuille.concat({
          ...beneficiaireCree,
          creationDate: DateTime.now().toISO(),
          estAArchiver: false,
        })
      )
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
    <FormulaireBeneficiaireFranceTravail
      aAccesMap={!estConseilDepartemental(conseiller.structure)}
      listes={listes}
      creerBeneficiaireFranceTravail={creerBeneficiaireFranceTravail}
      creationError={creationError}
      creationEnCours={creationEnCours}
    />
  )
}

export default withTransaction(
  CreationBeneficiaireFranceTravailPage.name,
  'page'
)(CreationBeneficiaireFranceTravailPage)
