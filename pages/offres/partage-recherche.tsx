import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useMemo, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import SuggestionCard from 'components/offres/suggestions/SuggestionCard'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { TypeLocalite } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { SuggestionsService } from 'services/suggestions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type CriteresRecherche =
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

type PartageRechercheProps = PageProps & {
  jeunes: BaseJeune[]
  type: TypeOffre
  criteresRecherche: CriteresRecherche
  withoutChat: true
  returnTo: string
}

function PartageRecherche({
  jeunes,
  type,
  criteresRecherche,
  returnTo,
}: PartageRechercheProps) {
  const suggestionsService =
    useDependance<SuggestionsService>('suggestionsService')
  const router = useRouter()
  const [idsDestinataires, setIdsDestinataires] = useState<
    RequiredValue<string[]>
  >({ value: [] })
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  const formIsValid = useMemo(
    () => idsDestinataires.value.length > 0,
    [idsDestinataires]
  )

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

  function updateIdsDestinataires(selectedIds: string[]) {
    setIdsDestinataires({
      value: selectedIds,
      error: !selectedIds.length
        ? "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
        : undefined,
    })
  }

  async function partagerCriteresRecherche(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid) return

    setIsPartageEnCours(true)

    try {
      await envoyerSuggestion()
      await router.push({
        pathname: '/recherche-offres',
        query: { [QueryParam.suggestionRecherche]: QueryValue.succes },
      })
    } finally {
      setIsPartageEnCours(false)
    }
  }

  async function envoyerSuggestion() {
    switch (type) {
      case TypeOffre.EMPLOI:
        await envoyerSuggestionOffreEmploi()
        break
      case TypeOffre.ALTERNANCE:
        await envoyerSuggestionAlternance()
        break
      case TypeOffre.SERVICE_CIVIQUE:
        await envoyerSuggestionServiceCivique()
        break
      case TypeOffre.IMMERSION:
        await envoyerSuggestionImmersion()
        break
    }
  }

  async function envoyerSuggestionOffreEmploi(): Promise<void> {
    const { titre, motsCles, typeLocalite, labelLocalite, codeLocalite } =
      criteresRecherche as CriteresRechercheOffreEmploiProps

    await suggestionsService.envoyerSuggestionOffreEmploi({
      idsJeunes: idsDestinataires.value,
      titre,
      motsCles,
      labelLocalite,
      codeDepartement:
        typeLocalite === 'DEPARTEMENT' ? codeLocalite : undefined,
      codeCommune: typeLocalite === 'COMMUNE' ? codeLocalite : undefined,
    })
  }

  async function envoyerSuggestionAlternance(): Promise<void> {
    const { titre, motsCles, typeLocalite, labelLocalite, codeLocalite } =
      criteresRecherche as CriteresRechercheOffreEmploiProps

    await suggestionsService.envoyerSuggestionAlternance({
      idsJeunes: idsDestinataires.value,
      titre,
      motsCles,
      labelLocalite,
      codeDepartement:
        typeLocalite === 'DEPARTEMENT' ? codeLocalite : undefined,
      codeCommune: typeLocalite === 'COMMUNE' ? codeLocalite : undefined,
    })
  }

  async function envoyerSuggestionImmersion(): Promise<void> {
    const {
      titre,
      labelMetier,
      codeMetier,
      labelLocalite,
      latitude,
      longitude,
    } = criteresRecherche as CriteresRechercheImmersionProps

    await suggestionsService.envoyerSuggestionImmersion({
      idsJeunes: idsDestinataires.value,
      titre,
      labelMetier,
      codeMetier,
      labelLocalite,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
  }

  async function envoyerSuggestionServiceCivique(): Promise<void> {
    const { titre, labelLocalite, latitude, longitude } =
      criteresRecherche as CriteresRechercheServiceCiviqueProps

    await suggestionsService.envoyerSuggestionServiceCivique({
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
        Ces critères apparaitrons dans la section favoris, catégorie recherches
        sauvegardées, du bénéficiaire de l’application CEJ.
      </p>
      <form onSubmit={partagerCriteresRecherche} className='mt-8'>
        <Etape numero={1} titre='Destinataires'>
          <JeunesMultiselectAutocomplete
            jeunes={jeunes}
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
            disabled={!formIsValid}
            isLoading={isPartageEnCours}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-blanc'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PartageRechercheProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  const jeunesService = withDependance<JeunesService>('jeunesService')
  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  const referer = context.req.headers.referer
  const redirectTo = referer ?? '/recherche-offres'
  const typeOffre: TypeOffre = context.query.type as TypeOffre
  let criteresRecherche: CriteresRecherche

  switch (typeOffre) {
    case TypeOffre.EMPLOI:
    case TypeOffre.ALTERNANCE:
      criteresRecherche = {
        titre: context.query.titre as string,
        motsCles: context.query.motsCles as string,
        typeLocalite: context.query.typeLocalite as TypeLocalite,
        labelLocalite: context.query.labelLocalite as string,
        codeLocalite: context.query.codeLocalite as string,
      }
      break
    case TypeOffre.IMMERSION:
      criteresRecherche = {
        titre: context.query.titre as string,
        labelMetier: context.query.labelMetier as string,
        codeMetier: context.query.codeMetier as string,
        labelLocalite: context.query.labelLocalite as string,
        latitude: context.query.latitude as string,
        longitude: context.query.longitude as string,
      }
      break
    case TypeOffre.SERVICE_CIVIQUE:
      criteresRecherche = {
        titre: context.query.titre as string,
        labelLocalite: context.query.labelLocalite as string,
        latitude: context.query.latitude as string,
        longitude: context.query.longitude as string,
      }
      break
  }

  return {
    props: {
      jeunes,
      type: typeOffre,
      criteresRecherche: criteresRecherche,
      withoutChat: true,
      returnTo: redirectTo,
      pageTitle: 'Partager une recherche',
    },
  }
}

export default withTransaction(PartageRecherche.name, 'page')(PartageRecherche)
