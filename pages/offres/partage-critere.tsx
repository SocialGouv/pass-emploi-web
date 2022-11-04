import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useMemo, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import CriteresOffresEmploiCard from 'components/offres/criteres/CriteresOffresEmploiCard'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { Localite } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { RecherchesService } from 'services/recherches.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { decodeBase64 } from 'utils/encoding/base64-enconding'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PartageCritereProps = PageProps & {
  jeunes: BaseJeune[]
  type: TypeOffre
  criteresDeRecherche: SearchOffresEmploiQuery
  withoutChat: true
  returnTo: string
}

function PartageCritere({
  jeunes,
  type,
  criteresDeRecherche,
  returnTo,
}: PartageCritereProps) {
  const recherchesService =
    useDependance<RecherchesService>('recherchesService')
  const router = useRouter()
  const [idsDestinataires, setIdsDestinataires] = useState<
    RequiredValue<string[]>
  >({ value: [] })
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  const localite = getLocalite(criteresDeRecherche)
  const titre = getTitre(criteresDeRecherche.motsCles, localite)

  const formIsValid = useMemo(
    () => idsDestinataires.value.length > 0,
    [idsDestinataires]
  )

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
      await recherchesService.postCriteresRechercheOffreEmploi(
        idsDestinataires.value,
        criteresDeRecherche,
        titre,
        localite?.libelle
      )
      await router.push({
        pathname: '/recherche-offres',
        query: { [QueryParam.partageCriteres]: QueryValue.succes },
      })
    } finally {
      setIsPartageEnCours(false)
    }
  }

  return (
    <>
      <CriteresOffresEmploiCard
        titre={titre}
        localite={localite}
        criteres={criteresDeRecherche}
      />
      <p className='mt-8'>
        Ces critères apparaitrons dans la section favoris, catégorie recherches
        sauvegardées,du bénéficiaire de l’application CEJ.
      </p>
      <form onSubmit={partagerCriteresRecherche} className='mt-8'>
        <Etape numero={1} titre='Bénéficiaires'>
          <JeunesMultiselectAutocomplete
            jeunes={jeunes}
            typeSelection='Bénéficiaires'
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

function getLocalite(criteres: SearchOffresEmploiQuery): Localite | undefined {
  if (criteres.departement) {
    return criteres.departement
  } else if (criteres.commune) {
    return criteres.commune
  }
}

function getTitre(motsCles?: string, localite?: Localite): string {
  return [motsCles, localite?.libelle].filter((e) => e).join(' - ')
}

export const getServerSideProps: GetServerSideProps<
  PartageCritereProps
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

  const criteresDecoded = decodeBase64(context.query.criteres as string)
  const queryOffresEmploi = JSON.parse(criteresDecoded)

  const referer = context.req.headers.referer
  const redirectTo = referer ?? '/recherche-offres'
  return {
    props: {
      jeunes,
      type: context.query.type as TypeOffre,
      criteresDeRecherche: queryOffresEmploi,
      returnTo: redirectTo,
      withoutChat: true,
      pageTitle: 'Partager une recherche',
    },
  }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
