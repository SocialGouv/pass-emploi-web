'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import SuggestionCard from 'components/offres/suggestions/SuggestionCard'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'
import { getNomJeuneComplet } from 'interfaces/jeune'
import { TypeOffre } from 'interfaces/offre'
import { TypeLocalite } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

export type CriteresRecherche =
  | CriteresRechercheOffreEmploiProps
  | CriteresRechercheImmersionProps
  | CriteresRechercheServiceCiviqueProps

type CriteresRechercheBase = {
  titre: string
  labelLocalite: string
}

type CriteresRechercheOffreEmploiProps = CriteresRechercheBase & {
  motsCles: string
  typeLocalite: TypeLocalite
  codeLocalite: string
}

type CriteresRechercheImmersionProps = CriteresRechercheBase & {
  labelMetier: string
  codeMetier: string
  latitude: string
  longitude: string
}

type CriteresRechercheServiceCiviqueProps = CriteresRechercheBase & {
  latitude: string
  longitude: string
}

type PartageRechercheProps = {
  type: TypeOffre
  criteresRecherche: CriteresRecherche
  returnTo: string
}

function PartageRecherchePage({
  type,
  criteresRecherche,
  returnTo,
}: PartageRechercheProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const [idsDestinataires, setIdsDestinataires] = useState<
    ValueWithError<string[]>
  >({ value: [] })
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  function formIsValid(): boolean {
    const destinatairesSontValides = idsDestinataires.value.length > 0
    if (!destinatairesSontValides)
      setIdsDestinataires({
        ...idsDestinataires,
        error:
          'Le champ ”Destinataires” est vide. Sélectionnez au moins un destinataire.',
      })
    return destinatairesSontValides
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return portefeuille.map((jeune) => ({
      id: jeune.id,
      value: getNomJeuneComplet(jeune),
    }))
  }

  function getLabelMetier(): string | undefined {
    switch (type) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return (criteresRecherche as CriteresRechercheOffreEmploiProps).motsCles
      case TypeOffre.IMMERSION:
        return (criteresRecherche as CriteresRechercheImmersionProps)
          .labelMetier
      case TypeOffre.SERVICE_CIVIQUE:
        return undefined
    }
  }

  function updateIdsDestinataires(selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) {
    setIdsDestinataires({
      value: selectedIds.beneficiaires!,
      error: !selectedIds.beneficiaires!.length
        ? 'Le champ ”Destinataires” est vide. Sélectionnez au moins un destinataire.'
        : undefined,
    })
  }

  async function partagerCriteresRecherche(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid()) return

    setIsPartageEnCours(true)

    try {
      await partagerRecherche()
      setAlerte(AlerteParam.suggestionRecherche)
      router.push('/offres')
    } finally {
      setIsPartageEnCours(false)
    }
  }

  async function partagerRecherche(): Promise<void> {
    switch (type) {
      case TypeOffre.EMPLOI:
        return partagerRechercheOffreEmploi()
      case TypeOffre.ALTERNANCE:
        return partagerRechercheAlternance()
      case TypeOffre.SERVICE_CIVIQUE:
        return partagerRechercheServiceCivique()
      case TypeOffre.IMMERSION:
        return partagerRechercheImmersion()
    }
  }

  async function partagerRechercheOffreEmploi(): Promise<void> {
    const { titre, motsCles, typeLocalite, labelLocalite, codeLocalite } =
      criteresRecherche as CriteresRechercheOffreEmploiProps

    const { partagerRechercheOffreEmploi: _partagerRechercheOffreEmploi } =
      await import('services/suggestions.service')
    await _partagerRechercheOffreEmploi({
      idsJeunes: idsDestinataires.value,
      titre,
      motsCles,
      labelLocalite,
      codeDepartement:
        typeLocalite === 'DEPARTEMENT' ? codeLocalite : undefined,
      codeCommune: typeLocalite === 'COMMUNE' ? codeLocalite : undefined,
    })
  }

  async function partagerRechercheAlternance(): Promise<void> {
    const { titre, motsCles, typeLocalite, labelLocalite, codeLocalite } =
      criteresRecherche as CriteresRechercheOffreEmploiProps

    const { partagerRechercheAlternance: _partagerRechercheAlternance } =
      await import('services/suggestions.service')
    await _partagerRechercheAlternance({
      idsJeunes: idsDestinataires.value,
      titre,
      motsCles,
      labelLocalite,
      codeDepartement:
        typeLocalite === 'DEPARTEMENT' ? codeLocalite : undefined,
      codeCommune: typeLocalite === 'COMMUNE' ? codeLocalite : undefined,
    })
  }

  async function partagerRechercheImmersion(): Promise<void> {
    const {
      titre,
      labelMetier,
      codeMetier,
      labelLocalite,
      latitude,
      longitude,
    } = criteresRecherche as CriteresRechercheImmersionProps

    const { partagerRechercheImmersion: _partagerRechercheImmersion } =
      await import('services/suggestions.service')
    await _partagerRechercheImmersion({
      idsJeunes: idsDestinataires.value,
      titre,
      labelMetier,
      codeMetier,
      labelLocalite,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
  }

  async function partagerRechercheServiceCivique(): Promise<void> {
    const { titre, labelLocalite, latitude, longitude } =
      criteresRecherche as CriteresRechercheServiceCiviqueProps

    const {
      partagerRechercheServiceCivique: _partagerRechercheServiceCivique,
    } = await import('services/suggestions.service')
    await _partagerRechercheServiceCivique({
      idsJeunes: idsDestinataires.value,
      titre,
      labelLocalite,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
  }

  return (
    <>
      <SuggestionCard
        type={type}
        titre={criteresRecherche.titre}
        labelLocalite={criteresRecherche.labelLocalite}
        labelMetier={getLabelMetier()}
      />

      <p className='mt-8'>
        Ces critères apparaîtront sur la page d’accueil et dans l’onglet
        recherche de l’application mobile du bénéficiaire. Une fois ajoutées par
        le bénéficiaire, celui-ci pourra recevoir des alertes d’offres
        correspondantes.
      </p>

      <form
        onSubmit={partagerCriteresRecherche}
        noValidate={true}
        className='mt-8'
      >
        <Etape numero={1} titre='Destinataires'>
          <BeneficiairesMultiselectAutocomplete
            id='select-beneficiaires'
            beneficiaires={buildOptionsJeunes()}
            typeSelection='Destinataires'
            onUpdate={updateIdsDestinataires}
            error={idsDestinataires.error}
          />
        </Etape>

        <div className='flex justify-center'>
          <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
            Annuler
          </ButtonLink>

          <Button
            type='submit'
            className='ml-3 flex items-center'
            isLoading={isPartageEnCours}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-white'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
}

export default withTransaction(
  PartageRecherchePage.name,
  'page'
)(PartageRecherchePage)
