import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import RenseignementAgencePoleEmploiModal from 'components/RenseignementAgencePoleEmploiModal'
import { StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ConseillerService } from 'services/conseiller.service'
import { ReferentielService } from 'services/referentiel.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import RenseignementAgenceMissionLocaleModal from 'components/RenseignementAgenceMissionLocaleModal'

interface HomePageProps {
  redirectUrl: string
  referentielAgences: Agence[]
}

function Home({ redirectUrl, referentielAgences }: HomePageProps) {
  const router = useRouter()
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const [conseiller, setConseiller] = useConseiller()

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence: agence.nom })
    setTrackingLabel('Succès ajout agence')
    await router.replace(
      `${redirectUrl}?${QueryParam.choixAgence}=${QueryValue.succes}`
    )
  }

  async function redirectToUrl() {
    await router.replace(redirectUrl)
  }

  useMatomo(trackingLabel)

  return (
    <>
      {conseiller?.structure === StructureConseiller.PASS_EMPLOI && (
        <RenseignementAgencePoleEmploiModal
          //TODO-1127 remove struture
          structureConseiller={
            conseiller?.structure ?? StructureConseiller.PASS_EMPLOI
          }
          referentielAgences={referentielAgences}
          onAgenceChoisie={selectAgence}
          onClose={redirectToUrl}
        />
      )}

      {conseiller?.structure === StructureConseiller.MILO && (
        <RenseignementAgenceMissionLocaleModal
          //TODO-1127 remove struture
          structureConseiller={
            conseiller?.structure ?? StructureConseiller.PASS_EMPLOI
          }
          referentielAgences={referentielAgences}
          onAgenceChoisie={selectAgence}
          onClose={redirectToUrl}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
): Promise<GetServerSidePropsResult<HomePageProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const sourceQueryParam = context.query.source
    ? `?source=${context.query.source}`
    : ''

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const conseiller = await conseillerService.getConseillerServerSide(
    user,
    accessToken
  )
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam
  if (
    //TODO-1127 GAD Boolean(conseiller.agence) ||
    user.structure === StructureConseiller.PASS_EMPLOI
  ) {
    return {
      redirect: {
        destination: `${redirectUrl}`,
        permanent: false,
      },
    }
  }

  const agenceService = withDependance<ReferentielService>('referentielService')
  const referentielAgences = await agenceService.getAgences(
    user.structure,
    accessToken
  )
  return {
    props: {
      redirectUrl,
      referentielAgences,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
