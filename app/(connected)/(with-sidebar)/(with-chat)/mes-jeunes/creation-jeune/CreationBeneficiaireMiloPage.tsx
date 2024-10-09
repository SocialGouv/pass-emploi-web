'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { ForwardedRef, forwardRef, useRef, useState } from 'react'

import DossierBeneficiaireMilo from 'components/jeune/DossierBeneficiaireMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import { DossierMilo } from 'interfaces/beneficiaire'
import { estMilo } from 'interfaces/conseiller'
import { BeneficiaireMiloFormData } from 'interfaces/json/beneficiaire'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

function CreationBeneficiaireMiloPage() {
  const [conseiller] = useConseiller()
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const etapeRef = useRef<HTMLDivElement>(null)

  const [dossier, setDossier] = useState<DossierMilo | undefined>()
  const [erreurDossier, setErreurDossier] = useState<string | undefined>()
  const [erreurCreation, setErreurCreation] = useState<string | undefined>()
  const [
    afficherModaleCompteBeneficiaireExisteDeja,
    setAfficherModaleCompteBeneficiaireExisteDeja,
  ] = useState<boolean>(false)

  async function rechercherDossier(id: string) {
    clearDossier()

    try {
      const { getDossierJeune } = await import('services/conseiller.service')
      const dossierJeune = await getDossierJeune(id)
      setDossier(dossierJeune)
      etapeRef.current!.focus()
    } catch (error) {
      setErreurDossier(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    }
  }

  async function creerCompteJeune(
    beneficiaireData: BeneficiaireMiloFormData,
    surcharge?: boolean
  ) {
    setErreurCreation(undefined)

    try {
      const { createCompteJeuneMilo } = await import(
        'services/conseiller.service'
      )
      const beneficiaireCree = await createCompteJeuneMilo(
        beneficiaireData,
        surcharge
      )

      setPortefeuille(portefeuille.concat(beneficiaireCree))
      setAlerte(AlerteParam.creationBeneficiaire, beneficiaireCree.id)
      router.push('/mes-jeunes')
      router.refresh()
    } catch (error) {
      setErreurCreation(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
      if (
        error instanceof ApiError &&
        error.statusCode === 422 &&
        estMilo(conseiller)
      ) {
        setAfficherModaleCompteBeneficiaireExisteDeja(true)
      }
    }
  }

  function clearDossier() {
    setErreurDossier(undefined)
    setDossier(undefined)
    setErreurCreation(undefined)
    setAfficherModaleCompteBeneficiaireExisteDeja(false)
  }

  useMatomo(
    erreurDossier
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune',
    portefeuille.length > 0
  )

  return (
    <>
      <CreationEtape etape={!dossier ? 1 : 2} ref={etapeRef} />

      {!dossier && (
        <div className='mt-4'>
          <FormulaireRechercheDossier
            onRechercheDossier={rechercherDossier}
            errMessage={erreurDossier}
          />
        </div>
      )}

      {dossier && (
        <DossierBeneficiaireMilo
          dossier={dossier}
          onCreateCompte={creerCompteJeune}
          erreurMessageCreationCompte={erreurCreation}
          beneficiaireExisteDejaMilo={
            afficherModaleCompteBeneficiaireExisteDeja
          }
          onRefresh={() => rechercherDossier(dossier.id)}
          onRetour={() => {
            clearDossier()
            etapeRef.current!.focus()
          }}
          onFermerModale={() => {
            setErreurCreation(undefined)
            setAfficherModaleCompteBeneficiaireExisteDeja(false)
          }}
        />
      )}
    </>
  )
}

const CreationEtape = forwardRef(
  ({ etape }: { etape: 1 | 2 }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <p
        className='bg-primary_lighten rounded-base w-auto inline-block p-2 text-base-medium text-primary'
        ref={ref}
        tabIndex={-1}
      >
        <span className='sr-only'>Création de compte : étape </span>
        {etape} sur 2
      </p>
    )
  }
)
CreationEtape.displayName = 'CreationEtape'

export default withTransaction(
  CreationBeneficiaireMiloPage.name,
  'page'
)(CreationBeneficiaireMiloPage)
