import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useMemo, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import SuggestionOffresEmploiCard from 'components/offres/suggestions/SuggestionOffresEmploiCard'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { LocaliteType } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { SuggestionsService } from 'services/suggestions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PartageCritereProps = PageProps & {
  jeunes: BaseJeune[]
  type: TypeOffre
  titre: string
  motsCles: string
  typeLocalite: LocaliteType
  labelLocalite: string
  codeLocalite: string
  withoutChat: true
  returnTo: string
}

function PartageCritere({
  jeunes,
  type,
  titre,
  motsCles,
  typeLocalite,
  labelLocalite,
  codeLocalite,
  returnTo,
}: PartageCritereProps) {
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
      await suggestionsService.postSuggestionOffreEmploi(
        idsDestinataires.value,
        titre,
        motsCles,
        labelLocalite,
        typeLocalite === 'DEPARTEMENT' ? codeLocalite : undefined,
        typeLocalite === 'COMMUNE' ? codeLocalite : undefined
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
      <SuggestionOffresEmploiCard
        titre={titre}
        motsCles={motsCles}
        labelLocalite={labelLocalite}
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

  const referer = context.req.headers.referer
  const redirectTo = referer ?? '/recherche-offres'

  return {
    props: {
      jeunes,
      type: context.query.type as TypeOffre,
      titre: context.query.titre as string,
      motsCles: context.query.motsCles as string,
      typeLocalite: context.query.typeLocalite as LocaliteType,
      labelLocalite: context.query.labelLocalite as string,
      codeLocalite: context.query.codeLocalite as string,
      withoutChat: true,
      returnTo: redirectTo,
      pageTitle: 'Partager une recherche',
    },
  }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
