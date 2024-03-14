'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import { DossierMilo } from 'interfaces/jeune'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

function CreationJeuneMiloPage() {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const [dossier, setDossier] = useState<DossierMilo | undefined>()
  const [erreurDossier, setErreurDossier] = useState<string | undefined>()
  const [erreurCreation, setErreurCreation] = useState<string | undefined>()

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function rechercherDossier(id: string) {
    setErreurDossier(undefined)
    setDossier(undefined)
    setErreurCreation(undefined)

    try {
      const { getDossierJeune } = await import('services/conseiller.service')
      setDossier(await getDossierJeune(id))
    } catch (error) {
      setErreurDossier(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    }
  }

  async function creerCompteJeune(beneficiaireData: JeuneMiloFormData) {
    setErreurCreation(undefined)

    try {
      const { createCompteJeuneMilo } = await import(
        'services/conseiller.service'
      )
      const beneficiaireCree = await createCompteJeuneMilo(beneficiaireData)

      setPortefeuille(portefeuille.concat(beneficiaireCree))
      setAlerte(AlerteParam.creationBeneficiaire, {
        variable: `${beneficiaireCree.prenom} ${beneficiaireCree.nom}`,
        target: beneficiaireCree.id,
      })
      router.push('/mes-jeunes')
    } catch (error) {
      setErreurCreation(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    }
  }

  useMatomo(
    erreurDossier
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune',
    aDesBeneficiaires
  )

  return (
    <>
      <CreationEtape etape={!dossier ? 1 : 2} />

      {!dossier && (
        <div className='mt-4'>
          <FormulaireRechercheDossier
            onRechercheDossier={rechercherDossier}
            errMessage={erreurDossier}
          />
        </div>
      )}

      {dossier && (
        <DossierJeuneMilo
          dossier={dossier}
          onCreateCompte={creerCompteJeune}
          erreurMessageHttpPassEmploi={erreurCreation}
        />
      )}
    </>
  )
}

function CreationEtape({ etape }: { etape: 1 | 2 }) {
  return (
    <div className='bg-primary_lighten rounded-base w-auto inline-block p-2 text-base-medium text-primary'>
      <span>{etape} sur 2</span>
    </div>
  )
}

export default withTransaction(
  CreationJeuneMiloPage.name,
  'page'
)(CreationJeuneMiloPage)
