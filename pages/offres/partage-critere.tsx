import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useMemo, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { jsonStringToQueryOffreEmploi } from 'interfaces/json/search-offre-query'
import { TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { decodeBase64 } from 'utils/encoding/base64-enconding'
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

  async function partager(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid) return

    setIsPartageEnCours(true)

    try {
      // TODO-1027 appel service
      await router.push({
        pathname: returnTo,
        query: { [QueryParam.partageOffre]: QueryValue.succes },
      })
    } finally {
      setIsPartageEnCours(false)
    }
  }

  return (
    <>
      <form onSubmit={partager} className='mt-8'></form>
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

  const criteresDecoded = decodeBase64(context.query.criteres as string)
  const queryOffresEmploi = jsonStringToQueryOffreEmploi(criteresDecoded)

  const referer = context.req.headers.referer
  const redirectTo = referer ?? '/recherche-offres'
  return {
    props: {
      jeunes,
      type: context.query.type as TypeOffre,
      criteresDeRecherche: queryOffresEmploi,
      returnTo: redirectTo,
      withoutChat: true,
      pageTitle: 'Partager une offre',
    },
  }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
